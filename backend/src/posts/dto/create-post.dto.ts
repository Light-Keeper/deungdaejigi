// src/posts/dto/create-post.dto.ts

/**
 * 📝 게시글 작성 DTO (Data Transfer Object)
 * 
 * 🔄 JWT 인증 적용 후 변경사항:
 * - authorNickname 필드 제거 → JWT 토큰에서 사용자 정보를 자동으로 추출하기 때문
 * - 클라이언트는 이제 사용자 정보를 직접 보내지 않음 (보안 강화)
 */

import { IsString } from 'class-validator';

export class CreatePostDto {
  /**
   * 📌 게시글 제목
   * - 필수 입력 필드
   * - 문자열 타입만 허용
   */
  @IsString()
  title: string;

  /**
   * 📌 게시글 내용  
   * - 필수 입력 필드
   * - 문자열 타입만 허용
   */
  @IsString()
  content: string;

  /**
   * 📌 게시글 카테고리
   * - 필수 입력 필드 (예: '일반', '질문', '공지' 등)
   * - 문자열 타입만 허용
   */
  @IsString()
  category: string;

  /**
   * ❌ 제거된 필드: authorNickname
   * 
   * 🔒 JWT 인증 적용으로 제거 이유:
   * 1. 보안: 클라이언트가 임의의 닉네임을 보낼 수 없음
   * 2. 자동화: JWT 토큰에서 실제 로그인한 사용자 정보를 추출
   * 3. 일관성: mood-diary와 동일한 인증 방식 사용
   * 
   * 🔄 대신 Controller에서 JWT 토큰으로부터:
   * - userId: 사용자 고유 ID 추출
   * - username: 사용자명을 authorNickname으로 사용
   */
}