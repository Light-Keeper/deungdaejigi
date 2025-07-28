// src/mood-diary/mood-diary.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MoodDiary, MoodDiaryDocument } from './schemas/mood-diary.schema';
import { CreateMoodDiaryDto } from './dto/create-mood-diary.dto';

// Controller에서 전달받을 데이터 타입 (JWT에서 추출된 userId 포함)
interface CreateMoodDiaryWithUserId extends CreateMoodDiaryDto {
  userId: string;
}

@Injectable()
export class MoodDiaryService {
  constructor(
    @InjectModel(MoodDiary.name) private moodDiaryModel: Model<MoodDiaryDocument>,
  ) {}

  /**
   * 새로운 마음 일기를 생성하고 MongoDB에 저장합니다.
   * 
   * @param data JWT에서 추출된 userId가 포함된 일기 데이터
   * @returns 생성된 MoodDiary 문서
   */
  async create(data: CreateMoodDiaryWithUserId): Promise<MoodDiary> {
    const { userId, date, mood, content } = data;

    // 날짜 처리: 클라이언트에서 'YYYY-MM-DD' 형식으로 받아 Date 객체로 변환
    const diaryDate = new Date(date);
    diaryDate.setUTCHours(0, 0, 0, 0); // UTC 기준 해당 날짜의 시작 시간으로 설정

    // userId를 Mongoose ObjectId로 변환
    const userIdObjectId = new Types.ObjectId(userId);

    // MoodDiary 문서 생성 및 저장
    const createdMoodDiary = new this.moodDiaryModel({
      userId: userIdObjectId,
      date: diaryDate,
      mood,
      content,
    });

    return createdMoodDiary.save();
  }

  /**
   * 특정 사용자의 특정 연도와 월에 해당하는 모든 마음 일기를 조회합니다.
   * 
   * @param userId JWT에서 추출된 사용자 ID (문자열)
   * @param year 조회할 연도
   * @param month 조회할 월 (1-12)
   * @returns 해당 월에 작성된 MoodDiary 문서 배열
   */
  async findMonthly(userId: string, year: number, month: number): Promise<MoodDiary[]> {
    // userId를 Mongoose ObjectId로 변환
    const userIdObjectId = new Types.ObjectId(userId);

    // 날짜 범위 설정
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0)); // 해당 월 1일
    const endDate = new Date(Date.UTC(year, month, 1, 0, 0, 0));       // 다음 월 1일

    // MongoDB 쿼리 실행
    return this.moodDiaryModel.find({
      userId: userIdObjectId,
      date: {
        $gte: startDate, // 크거나 같음
        $lt: endDate,    // 작음
      },
    }).sort({ date: 1 }) // 날짜 오름차순 정렬
      .exec();
  }
}