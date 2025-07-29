// src/posts/dto/find-all-posts.dto.ts

/**
 * 📋 게시글 목록 조회 관련 DTO들
 * 
 * 🎯 목적:
 * - 타입 안전성 보장
 * - 인터페이스 재사용
 * - 명확한 API 계약 정의
 */

import { IsOptional, IsString, IsNumberString } from 'class-validator';
import { Post } from '../schemas/post.schema';

/**
 * 📊 게시글 목록 조회 쿼리 파라미터 DTO
 * 
 * 💡 class-validator 사용으로 자동 검증
 */
export class FindAllPostsQueryDto {
  /**
   * 📄 페이지 번호 (1부터 시작)
   * 
   * @IsOptional() → 선택적 파라미터
   * @IsNumberString() → 숫자 문자열만 허용
   */
  @IsOptional()
  @IsNumberString()
  page?: string;

  /**
   * 📊 페이지당 게시글 수
   */
  @IsOptional()
  @IsNumberString()
  limit?: string;

  /**
   * 🏷️ 카테고리 필터
   */
  @IsOptional()
  @IsString()
  category?: string;

  /**
   * 📈 정렬 방식
   * 
   * 💡 허용 값: 'latest', 'popular', 'oldest'
   */
  @IsOptional()
  @IsString()
  sort?: string;
}

/**
 * 📋 게시글 목록 조회 옵션 인터페이스
 * 
 * 💡 서비스 레이어에서 사용 (DTO → Options 변환 후)
 */
export interface FindAllPostsOptions {
  page: number;        // 숫자로 변환된 페이지 번호
  limit: number;       // 숫자로 변환된 페이지당 개수
  category?: string;   // 카테고리 필터 (선택사항)
  sort: string;        // 정렬 방식 (기본값 적용됨)
}

/**
 * 📊 게시글 목록 조회 결과 인터페이스
 * 
 * 💡 API 응답 형태 정의
 */
export interface FindAllPostsResult {
  posts: Post[];       // 게시글 배열
  totalCount: number;  // 전체 게시글 수
  totalPages: number;  // 전체 페이지 수
  currentPage: number; // 현재 페이지
  hasNextPage: boolean; // 다음 페이지 존재 여부
  hasPrevPage: boolean; // 이전 페이지 존재 여부
}