// src/mood-diary/mood-diary.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport'; // JWT 가드 사용을 위해 추가
import { MoodDiaryService } from './mood-diary.service';
import { MoodDiaryController } from './mood-diary.controller';
import { MoodDiary, MoodDiarySchema } from './schemas/mood-diary.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MoodDiary.name, schema: MoodDiarySchema },
    ]),
    PassportModule, // 🔑 JWT 인증 가드 사용을 위해 추가
  ],
  providers: [MoodDiaryService],
  controllers: [MoodDiaryController],
})
export class MoodDiaryModule {}