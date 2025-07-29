// src/mood-diary/mood-diary.controller.ts
import { Controller, Post, Body, UseGuards, Req, Get, Param } from '@nestjs/common';
import { MoodDiaryService } from './mood-diary.service';
import { CreateMoodDiaryDto } from './dto/create-mood-diary.dto';
import { AuthGuard } from '@nestjs/passport';

// JWT Strategy에서 반환하는 사용자 정보 타입 (jwt.strategy.ts와 일치)
interface JwtUser {
  userId: string;   // 사용자 ID (MongoDB ObjectId)
  username: string; // 사용자명
}

// Request 객체에 user 정보가 추가된 타입
interface AuthenticatedRequest extends Request {
  user: JwtUser;
}

@Controller('mood-diary')
export class MoodDiaryController {
  constructor(private readonly moodDiaryService: MoodDiaryService) {}

  @Post()
  @UseGuards(AuthGuard('jwt')) // 🔓 JWT 가드 활성화
  async create(
    @Body() createMoodDiaryDto: CreateMoodDiaryDto,
    @Req() req: AuthenticatedRequest // 🔓 Request 활성화
  ) {
    // JWT 토큰에서 userId 추출
    const userId = req.user.userId;
    
    // Service 호출 시 userId 추가
    return this.moodDiaryService.create({
      ...createMoodDiaryDto,
      userId,
    });
  }

  // 월별 조회 API도 추가
  @Get(':year/:month')
  @UseGuards(AuthGuard('jwt'))
  async findMonthly(
    @Param('year') year: string,
    @Param('month') month: string,
    @Req() req: AuthenticatedRequest
  ) {
    const userId = req.user.userId;
    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);
    
    return this.moodDiaryService.findMonthly(userId, yearNum, monthNum);
  }
}