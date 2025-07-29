// src/comments/dto/update-comment.dto.ts

import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

// 댓글 수정 요청 시 사용되는 데이터 전송 객체 (DTO)
export class UpdateCommentDto {
  // 수정할 댓글 내용 (문자열, 선택 사항)
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly content?: string;
  
  // 수정할 작성자 닉네임 (문자열, 선택 사항)
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly authorNickname?: string;

  // 익명 여부 수정 (불리언, 선택 사항)
  @IsBoolean()
  @IsOptional()
  readonly isAnonymous?: boolean;
}
