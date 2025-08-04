import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Survey, SurveyDocument } from './schemas/survey.schema';
import { Welfare, WelfareDocument } from '../welfare/schemas/welfare.schema';

export interface RecommendationResult {
  welfare: Welfare;
  score: number;
  matchedCriteria: string[];
}

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);

  constructor(
    @InjectModel(Survey.name) private surveyModel: Model<SurveyDocument>,
    @InjectModel(Welfare.name) private welfareModel: Model<WelfareDocument>,
  ) {}

  /**
   * 설문 답변을 기반으로 복지 정보 추천
   * 점수 체계: 핵심키워드(30) + 연령대(15) + 돌봄상황(20) + 소득(15) + 서비스(20) + 특수상황(10) = 최대 110점
   */
  async getRecommendations(surveyId: string): Promise<RecommendationResult[]> {
    const survey = await this.surveyModel.findById(surveyId);
    if (!survey) {
      throw new Error('설문을 찾을 수 없습니다.');
    }

    const allWelfares = await this.welfareModel.find({});

    // 각 복지 정보에 대해 점수 계산
    const recommendations = allWelfares.map(welfare => 
      this.calculateMatchScore(survey, welfare)
    );

    // 점수 순으로 정렬하고 상위 10개 반환
    return recommendations
      .filter(rec => rec.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  /**
   * 설문 답변과 복지 정보 간의 매칭 점수 계산
   */
  private calculateMatchScore(survey: Survey, welfare: Welfare): RecommendationResult {
    // 해당 복지가 사용자에게 적용 가능한지 확인
    if (!this.isWelfareApplicable(survey, welfare)) {
      return {
        welfare,
        score: 0,
        matchedCriteria: []
      };
    }

    let score = 0;
    const matchedCriteria: string[] = [];

    // 0. 핵심 키워드 매칭 (가중치: 30점) - 가족돌봄청년 관련
    const keywordScore = this.matchKeywords(survey, welfare);
    if (keywordScore > 0) {
      score += keywordScore;
      matchedCriteria.push('핵심 대상 일치');
    }

    // 1. 연령대 매칭 (가중치: 15점)
    const ageScore = this.matchAgeGroup(survey.ageGroup, welfare.lifeCycle, welfare.serviceName);
    if (ageScore > 0) {
      score += ageScore;
      matchedCriteria.push('연령대 적합');
    }

    // 2. 돌봄 상황 매칭 (가중치: 20점)
    const careScore = this.matchCareContext(survey, welfare.targetAudience, welfare.serviceName);
    if (careScore > 0) {
      score += careScore;
      matchedCriteria.push('돌봄 상황 적합');
    }

    // 3. 소득 수준 매칭 (가중치: 15점)
    const incomeScore = this.matchIncomeLevel(survey.incomeLevel, welfare.targetAudience);
    if (incomeScore > 0) {
      score += incomeScore;
      matchedCriteria.push('소득 기준 적합');
    }

    // 4. 필요 서비스 매칭 (가중치: 20점) - 필수 조건
    const serviceScore = this.matchNeededServices(survey.neededServices, welfare.serviceCategory);
    if (serviceScore > 0) {
      score += serviceScore;
      matchedCriteria.push('필요 서비스 일치');
    } else {
      // 서비스가 매칭되지 않으면 추천하지 않음
      return {
        welfare,
        score: 0,
        matchedCriteria: []
      };
    }

    // 5. 특수 상황 매칭 (가중치: 10점)
    const specialScore = this.matchSpecialSituation(survey, welfare.targetAudience);
    if (specialScore > 0) {
      score += specialScore;
      matchedCriteria.push('특수 상황 적합');
    }

    return {
      welfare,
      score,
      matchedCriteria
    };
  }

  /**
   * 핵심 키워드 매칭 (가족돌봄청년 관련)
   */
  private matchKeywords(survey: Survey, welfare: Welfare): number {
    const serviceName = welfare.serviceName?.toLowerCase() || '';
    const description = welfare.description?.toLowerCase() || '';
    const fullText = serviceName + ' ' + description;

    let score = 0;

    // 가족돌봄청년/영케어러 직접 매칭 - 최고 점수
    const youthCareKeywords = ['가족돌봄청년', '영케어러', '케어러', '돌봄청년'];
    if (youthCareKeywords.some(keyword => fullText.includes(keyword))) {
      score += 30;
      return score; // 직접 매칭되면 다른 키워드는 체크하지 않음
    }

    // 청년 + 돌봄 조합 매칭
    if (fullText.includes('청년') && fullText.includes('돌봄')) {
      score += 25;
      return score;
    }

    // 돌봄 관련 서비스 (중장년, 가족 등과 함께 언급되는 경우만)
    if (fullText.includes('돌봄')) {
      const contextKeywords = ['중장년', '가족', '일상', '맞춤', '통합'];
      if (contextKeywords.some(keyword => fullText.includes(keyword))) {
        score += 20;
      }
    }

    // 위기가정/위기극복 매칭 (생계, 주거, 의료비와 함께 언급되는 경우만)
    if (fullText.includes('위기가정') || fullText.includes('위기극복')) {
      const supportKeywords = ['생계', '주거', '의료', '생활비'];
      if (supportKeywords.some(keyword => fullText.includes(keyword))) {
        score += 15;
      }
    }

    // 부적절한 서비스 제외
    const excludeKeywords = ['장제', '장례', '재외국민', '해외', '사망', '보이스피싱', '전기통신'];
    if (excludeKeywords.some(keyword => fullText.includes(keyword))) {
      return 0; // 명백히 관련없는 서비스는 0점
    }

    return score;
  }

  /**
   * 연령대 매칭 (개선)
   */
  private matchAgeGroup(ageGroup: string, lifeCycle: string[], serviceName?: string): number {
    // lifeCycle이 비어있으면 서비스명으로 판단
    if (!lifeCycle || lifeCycle.length === 0) {
      const name = serviceName?.toLowerCase() || '';
      
      // 청년 관련 키워드가 있으면 청년 대상으로 간주
      if (name.includes('청년') || name.includes('케어러')) {
        const youthAges = ['20~29세', '30~39세'];
        return youthAges.includes(ageGroup) ? 15 : 0;
      }
      
      // 특정 연령 제한이 없으면 기본 점수
      return 10;
    }

    const ageMapping = {
      '19세 미만': ['아동', '청소년'],
      '20~29세': ['청년', '청소년'],
      '30~39세': ['청년', '중장년'],
      '40~49세': ['중장년'],
      '50~64세': ['중장년', '노년'],
      '65세 이상': ['노년']
    };

    const targetAges = ageMapping[ageGroup] || [];
    const hasMatch = targetAges.some(age => lifeCycle.includes(age));
    
    return hasMatch ? 15 : 0;
  }

  /**
   * 돌봄 상황 매칭 (개선)
   */
  private matchCareContext(survey: Survey, targetAudience: string[], serviceName?: string): number {
    let score = 0;

    // 서비스명에서 돌봄 관련 키워드 직접 매칭
    const name = serviceName?.toLowerCase() || '';
    if (name.includes('돌봄') || name.includes('케어')) {
      score += 15;
    }

    // targetAudience에서 돌봄 관련 키워드 매칭
    if (targetAudience) {
      const careKeywords = ['청년', '가족돌봄', '돌봄'];
      const hasYouthCare = careKeywords.some(keyword => 
        targetAudience.some(target => target.includes(keyword))
      );
      
      if (hasYouthCare) score += 10;
    }

    // 돌봄 강도에 따른 추가 점수
    if (survey.dailyCareTime === '9시간 이상' || survey.carePeriod === '3년 이상') {
      score += 5;
    }

    return Math.min(score, 20); // 최대 20점
  }

  /**
   * 소득 수준 매칭 (개선)
   */
  private matchIncomeLevel(incomeLevel: string, targetAudience: string[]): number {
    if (!targetAudience || targetAudience.length === 0) return 12; // 대상 제한 없으면 기본 점수

    const lowIncomeGroups = ['기초생활수급자', '차상위계층', '중위소득 50% 이하'];
    const isLowIncome = lowIncomeGroups.includes(incomeLevel);

    // 저소득층이고 저소득 대상 복지인 경우
    if (isLowIncome && targetAudience.some(target => target.includes('저소득'))) {
      return 15;
    }

    // 고소득층인데 저소득 전용 복지라면 부적합
    if (!isLowIncome && targetAudience.some(target => target.includes('저소득'))) {
      return 0;
    }

    return 12; // 기본 점수
  }

  /**
   * 필요 서비스 매칭 (개선)
   */
  private matchNeededServices(neededServices: string[], serviceCategory: string[]): number {
    if (!serviceCategory || serviceCategory.length === 0) return 0;

    // 서비스 매핑 개선
    const serviceMapping = {
      '생활비 지원': ['생활지원', '복지', '생활비', '생계'],
      '의료비 지원': ['신체건강', '정신건강', '건강', '의료'],
      '교육비 지원': ['교육', '교육비'],
      '주거비 지원': ['주거', '주거비'],
      '돌봄서비스': ['보호·돌봄', '돌봄', '돌봄서비스', '돌봄·보호'],
      '상담서비스': ['상담', '심리상담', '정신건강'],
      '취업지원': ['일자리', '취업', '고용'],
      '문화활동': ['문화·여가', '문화', '여가']
    };

    let totalScore = 0;
    
    neededServices.forEach(needed => {
      const possibleCategories = serviceMapping[needed] || [needed];
      
      // 완전 일치 우선, 부분 매칭도 허용
      const exactMatch = possibleCategories.some(category => 
        serviceCategory.includes(category)
      );
      
      const partialMatch = possibleCategories.some(category => 
        serviceCategory.some(svc => 
          svc.includes(category) || category.includes(svc)
        )
      );
      
      if (exactMatch) {
        totalScore += 7; // 완전 일치 시 높은 점수
      } else if (partialMatch) {
        totalScore += 4; // 부분 일치 시 낮은 점수
      }
    });

    return Math.min(totalScore, 20); // 최대 20점
  }

  /**
   * 특수 상황 매칭 (개선)
   */
  private matchSpecialSituation(survey: Survey, targetAudience: string[]): number {
    if (!targetAudience) return 0;

    let score = 0;

    // 장애인 매칭
    if (survey.hasDisability && targetAudience.some(target => target.includes('장애'))) {
      score += 5;
    }

    // 다문화가족 매칭
    if (survey.isMulticulturalFamily && targetAudience.some(target => target.includes('다문화'))) {
      score += 5;
    }

    // 한부모가족 매칭 (개선)
    if (survey.isSingleParentFamily && targetAudience.some(target => 
      target.includes('한부모') || target.includes('조손')
    )) {
      score += 5;
    }

    return score;
  }

  /**
   * 복지 서비스 적용 가능성 검사 (개선)
   */
  private isWelfareApplicable(survey: Survey, welfare: Welfare): boolean {
    const serviceName = welfare.serviceName?.toLowerCase() || '';
    const description = welfare.description?.toLowerCase() || '';
    const fullText = serviceName + ' ' + description;
    
    // 1. 가족돌봄청년 관련 복지는 무조건 포함
    const youthCareKeywords = ['가족돌봄청년', '영케어러', '케어러', '돌봄청년'];
    if (youthCareKeywords.some(keyword => fullText.includes(keyword))) {
      return true;
    }

    // 2. 연령 제한 체크 (완화)
    const childKeywords = ['영유아', '유아', '어린이', '아동', '미취학', '초등'];
    const elderKeywords = ['노인', '어르신', '65세 이상', '만 65세', '기초연금'];
    
    // 아동 대상 복지 - 자녀를 돌보는 경우만 해당
    if (childKeywords.some(keyword => fullText.includes(keyword))) {
      return survey.careTarget === '자녀';
    }
    
    // 노인 대상 복지 - 65세 이상이거나 부모님/조부모를 돌보는 경우
    if (elderKeywords.some(keyword => fullText.includes(keyword))) {
      return survey.ageGroup === '65세 이상' || 
             survey.careTarget === '부모님' || 
             survey.careTarget === '조부모';
    }
    
    // 3. 특수 상황 체크 (완화)
    if (fullText.includes('장애') && !survey.hasDisability && 
        !['부모님', '조부모', '배우자', '자녀', '형제자매'].includes(survey.careTarget)) {
      return false; // 장애인 복지이지만 본인이 장애인이 아니고 가족도 돌보지 않는 경우만 제외
    }
    
    // 4. 명백히 부적합한 경우만 제외
    const excludeKeywords = ['산재', '의무경찰', '어선원', '농업인', '성폭력', '가정폭력'];
    if (excludeKeywords.some(keyword => fullText.includes(keyword))) {
      return false;
    }
    
    return true; // 대부분의 경우 포함
  }

  /**
   * 설문 저장
   */
  async saveSurvey(surveyData: Partial<Survey>): Promise<SurveyDocument> {
    const survey = new this.surveyModel(surveyData);
    return survey.save();
  }

  /**
   * 사용자별 설문 이력 조회
   */
  async getUserSurveys(userId: string): Promise<Survey[]> {
    return this.surveyModel.find({ userId }).sort({ createdAt: -1 });
  }
}