import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RecommendationService, RecommendationResult } from './recommendation.service';
import { CreateSurveyDto } from './dto/survey.dto';

@ApiTags('복지 추천')
@Controller('recommendations')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  /**
   * 설문 제출 및 복지 추천
   */
  @Post('survey')
  @ApiOperation({
    summary: '설문 제출 및 복지 정보 추천',
    description: '설문을 제출하고 AI 분석을 통해 맞춤 복지 정보를 추천받습니다.',
  })
  @ApiResponse({
    status: 201,
    description: '설문 저장 및 추천 완료',
    schema: {
      properties: {
        surveyId: { type: 'string' },
        recommendations: {
          type: 'array',
          items: {
            properties: {
              welfare: { type: 'object' },
              score: { type: 'number' },
              matchedCriteria: { type: 'array', items: { type: 'string' } }
            }
          }
        },
        message: { type: 'string' }
      }
    }
  })
  async submitSurveyAndGetRecommendations(@Body() surveyDto: CreateSurveyDto) {
    // 설문 저장
    const savedSurvey = await this.recommendationService.saveSurvey(surveyDto);
    
    // 추천 분석
    const recommendations = await this.recommendationService.getRecommendations(
      savedSurvey._id.toString()
    );

    return {
      surveyId: savedSurvey._id.toString(),
      recommendations,
      message: `${recommendations.length}개의 맞춤 복지 정보를 찾았습니다.`
    };
  }

  /**
   * 기존 설문 기반 재추천
   */
  @Get('survey/:surveyId')
  @ApiOperation({
    summary: '기존 설문 기반 재추천',
    description: '이전에 제출한 설문을 기반으로 복지 정보를 다시 추천받습니다.',
  })
  async getRecommendationsBySurvey(@Param('surveyId') surveyId: string) {
    const recommendations = await this.recommendationService.getRecommendations(surveyId);
    
    return {
      recommendations,
      message: `${recommendations.length}개의 맞춤 복지 정보를 찾았습니다.`
    };
  }

  /**
   * 사용자 설문 이력 조회
   */
  @Get('user/:userId/history')
  @ApiOperation({
    summary: '사용자 설문 이력 조회',
    description: '사용자의 설문 제출 이력을 조회합니다.',
  })
  async getUserSurveyHistory(@Param('userId') userId: string) {
    const surveys = await this.recommendationService.getUserSurveys(userId);
    
    return {
      surveys,
      count: surveys.length
    };
  }
}