// src/mood-diary/mood-diary.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose'; // Model과 Types를 mongoose에서 임포트합니다.
import { MoodDiary, MoodDiaryDocument } from './schemas/mood-diary.schema';
import { CreateMoodDiaryDto } from './dto/create-mood-diary.dto';

@Injectable()
export class MoodDiaryService {
  constructor(
    // NestJS의 InjectModel 데코레이터를 사용하여 MoodDiary 모델을 주입받습니다.
    @InjectModel(MoodDiary.name) private moodDiaryModel: Model<MoodDiaryDocument>,
  ) {}

  /**
   * 새로운 마음 일기를 생성하고 MongoDB에 저장합니다.
   *
   * @param createMoodDiaryDto 일기 작성을 위한 데이터 (userId, date, mood, content).
   * mood 필드는 UI에서 선택된 값(예: '좋음', '슬픔')으로 제한됩니다.
   * @returns 생성된 MoodDiary 문서.
   */
  async create(createMoodDiaryDto: CreateMoodDiaryDto): Promise<MoodDiary> {
    const { userId, date, mood, content } = createMoodDiaryDto;

    // 1. 날짜 처리:
    // 클라이언트에서 'YYYY-MM-DD' 형식의 문자열로 날짜를 받아 Date 객체로 변환합니다.
    // MongoDB에 저장할 때 일반적으로 UTC로 저장하는 것이 좋습니다.
    // 시간을 00:00:00.000Z로 설정하여 날짜만 중요하게 처리합니다.
    const diaryDate = new Date(date);
    diaryDate.setUTCHours(0, 0, 0, 0); // UTC 기준 해당 날짜의 시작 시간으로 설정

    // 2. userId 처리:
    // 클라이언트에서 받은 userId(문자열)를 Mongoose의 ObjectId 타입으로 변환합니다.
    const userIdObjectId = new Types.ObjectId(userId);

    // 3. MoodDiary 문서 생성 및 저장:
    const createdMoodDiary = new this.moodDiaryModel({
      userId: userIdObjectId,
      date: diaryDate,
      mood: mood, // DTO에서 이미 유효성 검사(@IsIn)를 거쳤습니다.
      content: content,
    });

    return createdMoodDiary.save(); // 데이터베이스에 저장
  }

  /**
   * 특정 사용자의 특정 연도와 월에 해당하는 모든 마음 일기를 조회합니다.
   *
   * @param userId 조회할 사용자의 ID (문자열 형태).
   * @param year 조회할 연도 (숫자, 예: 2025).
   * @param month 조회할 월 (숫자, 1-12, 예: 7).
   * @returns 해당 월에 작성된 MoodDiary 문서 배열.
   */
  async findMonthly(userId: string, year: number, month: number): Promise<MoodDiary[]> {
    // 1. userId 처리:
    // 조회할 userId(문자열)를 Mongoose의 ObjectId 타입으로 변환합니다.
    const userIdObjectId = new Types.ObjectId(userId);

    // 2. 날짜 범위 설정:
    // 해당 월의 시작일과 다음 월의 시작일을 UTC 기준으로 설정하여 쿼리 범위를 정의합니다.
    // month는 0부터 시작하므로 입력받은 month에서 1을 빼줍니다.
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0)); // 해당 월 1일 00:00:00 UTC
    const endDate = new Date(Date.UTC(year, month, 1, 0, 0, 0));     // 다음 월 1일 00:00:00 UTC

    // 3. MongoDB 쿼리 실행:
    // userId가 일치하고, date가 startDate보다 크거나 같고 endDate보다 작은 문서를 찾습니다.
    // 결과를 날짜 오름차순으로 정렬합니다.
    return this.moodDiaryModel.find({
      userId: userIdObjectId,
      date: {
        $gte: startDate, // Greater Than or Equal (크거나 같음)
        $lt: endDate,    // Less Than (작음)
      },
    }).sort({ date: 1 }) // 날짜 오름차순 정렬 (과거 일기부터)
      .exec();           // 쿼리 실행
  }
}