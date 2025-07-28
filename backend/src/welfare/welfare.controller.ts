import { Controller, Get, Query } from '@nestjs/common';
import { WelfareService } from './welfare.service';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger'; // Swagger 데코레이터 임포트

@ApiTags('복지 정보')
@Controller('welfare')
export class WelfareController {
  constructor(private readonly welfareService: WelfareService) {}

  @Get('/sync')
  @ApiOperation({
    summary: '복지 정보 목록 최신화',
    description: '복지 정보 목록을 최신화합니다.',
  }) // API 오퍼레이션 설명
  @ApiResponse({
    status: 200,
    description: '성공적으로 복지 정보를 동기화했습니다.',
  }) // 성공 응답 설명
  @ApiResponse({ status: 400, description: '잘못된 요청 파라미터입니다.' })
  syncAllWelfareData() {
    return this.welfareService.syncAllWelfareData();
  }
}
