// src/welfare/dto/welfare.dto.ts (검색 기능 추가)

import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  IsUrl,
  IsOptional,
  IsDateString,
  IsNumberString,
} from 'class-validator';

// === 기존 DTO들 ===
export class CreateWelfareDto {
  @IsString()
  name: string;

  @IsString()
  provider: string;

  @IsString()
  description: string;

  @IsString()
  eligibility: string;

  @IsString()
  applicationMethod: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  requiredDocuments: string[];

  @IsString()
  @IsOptional()
  contact: string;

  @IsUrl()
  @IsOptional()
  applicationUrl: string;

  @IsString()
  mainCategory: string;

  @IsString()
  subCategory: string;

  @IsDateString()
  @IsOptional()
  applicationStartDate: Date;

  @IsDateString()
  @IsOptional()
  applicationEndDate: Date;
}

export class UpdateWelfareDto extends PartialType(CreateWelfareDto) {}

// === 새로 추가: 검색 관련 DTO들 ===

/**
 * 복지 정보 검색 쿼리 파라미터 DTO
 */
export class SearchWelfareQueryDto {
  @IsOptional()
  @IsString()
  keyword?: string; // 검색 키워드

  @IsOptional()
  @IsNumberString()
  page?: string; // 페이지 번호

  @IsOptional()
  @IsNumberString()
  limit?: string; // 페이지당 개수

  @IsOptional()
  @IsString()
  sourceType?: string; // 제공기관

  @IsOptional()
  @IsString()
  serviceCategory?: string; // 서비스 분야

  @IsOptional()
  @IsString()
  targetAudience?: string; // 지원 대상

  @IsOptional()
  @IsString()
  lifeCycle?: string; // 생애 주기

  @IsOptional()
  @IsString()
  provider?: string; // 제공자

  @IsOptional()
  @IsString()
  sort?: string; // 정렬 방식
}

/**
 * 복지 정보 검색 옵션 인터페이스
 */
export interface SearchWelfareOptions {
  keyword?: string;
  page: number;
  limit: number;
  sourceType?: string;
  serviceCategory?: string;
  targetAudience?: string;
  lifeCycle?: string;
  provider?: string;
  sort: string;
}

/**
 * 복지 정보 검색 결과 인터페이스
 */
export interface SearchWelfareResult {
  welfares: any[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}