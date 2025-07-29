// src/mood-diary/dto/create-mood-diary.dto.ts
import { IsNotEmpty, IsDateString, IsString, IsOptional, IsIn } from 'class-validator';

export class CreateMoodDiaryDto {
  // ❌ userId 제거! JWT에서 추출할 예정
  
  @IsNotEmpty()
  @IsDateString() // ISO 8601 형식의 날짜 문자열 검사 (예: "2025-07-27")
  date: string;

  @IsNotEmpty()
  @IsString()
  // UI에서 제공되는 정확한 감정 선택지들만 허용하도록 유효성 검사를 강화합니다.
  @IsIn(['매우 힘듦', '힘듦', '보통', '괜찮음', '좋음'])
  mood: string;

  @IsOptional() // 일기 내용은 선택 사항입니다.
  @IsString()
  content?: string;
}