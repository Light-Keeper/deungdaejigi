import { Controller, Get, Query } from '@nestjs/common';
import { SupportService } from './support.service'; // 서비스 임포트
import { GetSupportInfoQueryDto } from './dto/get-support-info.dto'; // DTO 임포트

@Controller('support') // API 경로: /support
export class SupportController { // 클래스 이름이 SupportController임을 확인하세요
  constructor(private readonly supportService: SupportService) {}

  @Get() // GET /support
  async findAll(@Query() query: GetSupportInfoQueryDto) {
    const { type, keyword } = query;

    if (type) {
      return this.supportService.findByType(type);
    }
    if (keyword) {
      return this.supportService.findByKeyword(keyword);
    }
    return this.supportService.findAll();
  }
}