// src/mood-diary/mood-diary.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MoodDiaryService } from './mood-diary.service';
import { MoodDiaryController } from './mood-diary.controller';
import { MoodDiary, MoodDiarySchema } from './schemas/mood-diary.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MoodDiary.name, schema: MoodDiarySchema }, // MoodDiary 모델을 Mongoose에 등록
    ]),
  ],
  providers: [MoodDiaryService],
  controllers: [MoodDiaryController],
})
export class MoodDiaryModule {}