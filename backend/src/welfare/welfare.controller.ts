// src/welfare/welfare.controller.ts (import 경로 수정)

import { Controller, Get, Query, Param } from '@nestjs/common';
import { WelfareService } from './welfare.service';
import { SearchWelfareQueryDto } from './dto/welfare.dto'; // 🔧 경로 수정
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

@ApiTags('복지 정보')
@Controller('welfare')
export class WelfareController {
  constructor(private readonly welfareService: WelfareService) {}

  /**
   * 복지 정보 데이터 동기화 API
   */
  @Get('/sync')
  @ApiOperation({
    summary: '복지 정보 목록 최신화',
    description: '복지 정보 목록을 최신화합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '성공적으로 복지 정보를 동기화했습니다.',
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 파라미터입니다.' })
  syncAllWelfareData() {
    return this.welfareService.syncAllWelfareData();
  }

  /**
   * 복지 정보 검색 및 조회 API
   */
  @Get()
  @ApiOperation({
    summary: '복지 정보 검색',
    description: '키워드 검색 및 다양한 필터로 복지 정보를 조회합니다.',
  })
  @ApiQuery({ name: 'keyword', required: false, description: '검색 키워드' })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'limit', required: false, description: '페이지당 개수' })
  @ApiQuery({ name: 'sourceType', required: false, description: '제공기관' })
  @ApiQuery({ name: 'serviceCategory', required: false, description: '서비스 분야' })
  @ApiQuery({ name: 'targetAudience', required: false, description: '지원 대상' })
  @ApiQuery({ name: 'lifeCycle', required: false, description: '생애 주기' })
  searchWelfares(@Query() query: SearchWelfareQueryDto) {
    // 안전한 타입 변환 처리
    const pageStr = query.page;
    const limitStr = query.limit;
    
    // undefined 체크 후 안전하게 변환
    const page = pageStr ? parseInt(pageStr, 10) : 1;
    const limit = limitStr ? Math.min(parseInt(limitStr, 10), 100) : 20;
    
    // NaN 체크 및 기본값 설정
    const safePage = isNaN(page) || page < 1 ? 1 : page;
    const safeLimit = isNaN(limit) || limit < 1 ? 20 : limit;
    
    // sort는 기본값 설정
    const sort = query.sort || 'latest';

    return this.welfareService.searchWelfares({
      keyword: query.keyword, // undefined 허용
      page: safePage,
      limit: safeLimit,
      sourceType: query.sourceType, // undefined 허용
      serviceCategory: query.serviceCategory, // undefined 허용
      targetAudience: query.targetAudience, // undefined 허용
      lifeCycle: query.lifeCycle, // undefined 허용
      provider: query.provider, // undefined 허용
      sort,
    });
  }

  /**
   * 특정 복지 정보 상세 조회 API
   */
  @Get(':id')
  @ApiOperation({
    summary: '복지 정보 상세 조회',
    description: '특정 복지 정보의 상세 내용을 조회합니다.',
  })
  @ApiResponse({ status: 200, description: '복지 정보 조회 성공' })
  @ApiResponse({ status: 404, description: '복지 정보를 찾을 수 없습니다' })
  findOne(@Param('id') id: string) {
    return this.welfareService.findOne(id);
  }

  /**
   * 복지 정보 필터 옵션 조회 API
   */
  @Get('/filters/options')
  @ApiOperation({
    summary: '필터 옵션 조회',
    description: '검색 필터에 사용할 수 있는 옵션들을 조회합니다.',
  })
  getFilterOptions() {
    return this.welfareService.getFilterOptions();
  }
}