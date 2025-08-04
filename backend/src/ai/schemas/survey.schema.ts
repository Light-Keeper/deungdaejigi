import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true, collection: 'surveys' })
export class Survey {
  @Prop({ required: true })
  userId: string;

  // 1. 거주 지역
  @Prop({ 
    required: true, 
    enum: ['서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '강원도', '충청도', '전라도', '경상도', '제주도'] 
  })
  location: string;

  // 2. 나이
  @Prop({ 
    required: true, 
    enum: ['19세 미만', '20~29세', '30~39세', '40~49세', '50~64세', '65세 이상'] 
  })
  ageGroup: string;

  // 3. 현재 학업/취업 상태
  @Prop({ 
    required: true, 
    enum: ['학생', '휴학중', '취업준비중', '정규직', '비정규직', '프리랜서', '무직'] 
  })
  employmentStatus: string;

  // 4. 가구 소득 수준
  @Prop({ 
    required: true, 
    enum: ['기초생활수급자', '차상위계층', '중위소득 50% 이하', '중위소득 100% 이하', '중위소득 100% 초과'] 
  })
  incomeLevel: string;

  // 5. 돌보고 있는 가족
  @Prop({ 
    required: true, 
    enum: ['부모님', '조부모', '배우자', '자녀', '형제자매', '기타'] 
  })
  careTarget: string;

  // 6. 가족 돌봄 기간
  @Prop({ 
    required: true, 
    enum: ['6개월 미만', '6개월~1년', '1~3년', '3년 이상'] 
  })
  carePeriod: string;

  // 7. 하루 평균 돌봄 시간
  @Prop({ 
    required: true, 
    enum: ['1-2시간', '3-5시간', '6-8시간', '9시간 이상'] 
  })
  dailyCareTime: string;

  // 8. 필요한 지원 서비스 (복수선택)
  @Prop({ 
    required: true, 
    type: [String], 
    enum: ['생활비 지원', '의료비 지원', '교육비 지원', '주거비 지원', '돌봄서비스', '상담서비스', '취업지원', '문화활동'] 
  })
  neededServices: string[];

  // 9. 특수 상황
  @Prop({ default: false })
  hasDisability: boolean; // 본인 장애 여부

  @Prop({ default: false })
  isMulticulturalFamily: boolean; // 다문화가족 여부

  @Prop({ default: false })
  isSingleParentFamily: boolean; // 한부모가족 여부
}

export type SurveyDocument = HydratedDocument<Survey>;
export const SurveySchema = SchemaFactory.createForClass(Survey);