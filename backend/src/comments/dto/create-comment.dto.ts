// src/comments/dto/create-comment.dto.ts

import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

// 댓글 생성 요청 시 사용되는 데이터 전송 객체 (DTO)
export class CreateCommentDto {
  // 댓글 내용 (문자열, 필수)
  @IsString()
  @IsNotEmpty()
  readonly content: string;

  // 작성자 닉네임 (문자열, 필수)
  @IsString()
  @IsNotEmpty()
  readonly authorNickname: string;

  // 익명 여부 (불리언, 선택 사항)
  @IsBoolean()
  @IsOptional()
  readonly isAnonymous?: boolean;
}
