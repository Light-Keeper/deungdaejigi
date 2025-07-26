import { Controller, Get, Param } from '@nestjs/common';
import { WelfareService } from './welfare.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Welfare')
@Controller('welfare')
export class WelfareController {
  constructor(private readonly welfareService: WelfareService) {}

  @Get()
  @ApiOperation({ summary: '신청 가능한 복지 목록 조회' })
  @ApiResponse({ status: 200, description: '조회 성공' })
  findAllAvailable() {
    return this.welfareService.findAvailable();
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 복지 상세 조회' })
  @ApiResponse({ status: 200, description: '조회 성공' })
  @ApiResponse({ status: 404, description: '해당 복지를 찾을 수 없음' })
  findOne(@Param('id') id: string) {
    return this.welfareService.findOne(id);
  }
}
