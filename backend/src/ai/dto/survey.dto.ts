import { IsString, IsArray, IsBoolean, IsIn, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSurveyDto {
  @ApiProperty({ description: '사용자 ID', example: 'user123' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ 
    description: '거주 지역', 
    enum: ['서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '강원도', '충청도', '전라도', '경상도', '제주도'] 
  })
  @IsIn(['서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '강원도', '충청도', '전라도', '경상도', '제주도'])
  location: string;

  @ApiProperty({ 
    description: '나이', 
    enum: ['19세 미만', '20~29세', '30~39세', '40~49세', '50~64세', '65세 이상'] 
  })
  @IsIn(['19세 미만', '20~29세', '30~39세', '40~49세', '50~64세', '65세 이상'])
  ageGroup: string;

  @ApiProperty({ 
    description: '현재 학업/취업 상태', 
    enum: ['학생', '휴학중', '취업준비중', '정규직', '비정규직', '프리랜서', '무직'] 
  })
  @IsIn(['학생', '휴학중', '취업준비중', '정규직', '비정규직', '프리랜서', '무직'])
  employmentStatus: string;

  @ApiProperty({ 
    description: '가구 소득 수준', 
    enum: ['기초생활수급자', '차상위계층', '중위소득 50% 이하', '중위소득 100% 이하', '중위소득 100% 초과'] 
  })
  @IsIn(['기초생활수급자', '차상위계층', '중위소득 50% 이하', '중위소득 100% 이하', '중위소득 100% 초과'])
  incomeLevel: string;

  @ApiProperty({ 
    description: '돌보고 있는 가족', 
    enum: ['부모님', '조부모', '배우자', '자녀', '형제자매', '기타'] 
  })
  @IsIn(['부모님', '조부모', '배우자', '자녀', '형제자매', '기타'])
  careTarget: string;

  @ApiProperty({ 
    description: '가족 돌봄 기간', 
    enum: ['6개월 미만', '6개월~1년', '1~3년', '3년 이상'] 
  })
  @IsIn(['6개월 미만', '6개월~1년', '1~3년', '3년 이상'])
  carePeriod: string;

  @ApiProperty({ 
    description: '하루 평균 돌봄 시간', 
    enum: ['1-2시간', '3-5시간', '6-8시간', '9시간 이상'] 
  })
  @IsIn(['1-2시간', '3-5시간', '6-8시간', '9시간 이상'])
  dailyCareTime: string;

  @ApiProperty({ 
    description: '필요한 지원 서비스 (복수선택)', 
    type: [String],
    enum: ['생활비 지원', '의료비 지원', '교육비 지원', '주거비 지원', '돌봄서비스', '상담서비스', '취업지원', '문화활동'],
    example: ['생활비 지원', '상담서비스']
  })
  @IsArray()
  @IsString({ each: true })
  neededServices: string[];

  @ApiProperty({ description: '본인 장애 여부', default: false })
  @IsBoolean()
  hasDisability?: boolean;

  @ApiProperty({ description: '다문화가족 여부', default: false })
  @IsBoolean()
  isMulticulturalFamily?: boolean;

  @ApiProperty({ description: '한부모가족 여부', default: false })
  @IsBoolean()
  isSingleParentFamily?: boolean;
}