// src/mood-diary/mood-diary.controller.ts
import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { MoodDiaryService } from './mood-diary.service';
import { CreateMoodDiaryDto } from './dto/create-mood-diary.dto';
import { AuthGuard } from '@nestjs/passport'; // JWT 인증 가드 (인증 구현 시 주석 해제)
// import { Request } from 'express'; // Request 타입 (인증 구현 시 필요)

@Controller('mood-diary')
export class MoodDiaryController {
  constructor(private readonly moodDiaryService: MoodDiaryService) {}

  @Post()
  // @UseGuards(AuthGuard('jwt')) // 이 API는 로그인된 사용자만 접근 가능하도록 설정합니다.
  async create(
    @Body() createMoodDiaryDto: CreateMoodDiaryDto,
    // @Req() req: Request // JWT 토큰에서 userId를 추출할 때 사용 (인증 구현 시)
  ) {
    // 실제 구현에서는 req.user.id 등 인증된 사용자 정보를 사용해야 합니다.
    // 현재는 DTO에서 userId를 직접 받는 것으로 가정합니다.
    return this.moodDiaryService.create(createMoodDiaryDto);
  }
}