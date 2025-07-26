// src/mood-diary/schemas/mood-diary.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
// User 스키마 경로를 실제 프로젝트에 맞게 조정해주세요.
// 예: '../../auth/schemas/user.schema' 또는 'src/auth/schemas/user.schema'
import { User } from 'src/users/schemas/user.schema'; // 사용자 스키마 임포트 (가정)

export type MoodDiaryDocument = MoodDiary & Document;

@Schema({ timestamps: true }) // createdAt, updatedAt 필드 자동 생성
export class MoodDiary {
  // 사용자의 ObjectId를 참조하여 어떤 사용자의 일기인지 연결합니다.
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: mongoose.Types.ObjectId;

  // 일기 작성 날짜. 시간 정보는 중요하지 않으므로 YYYY-MM-DD 형태로 저장될 것입니다.
  @Prop({ required: true })
  date: Date;

  // 감정 상태. UI에 명시된 5가지 감정만 허용하도록 백엔드에서 유효성 검사를 강화할 것입니다.
  @Prop({ required: true })
  mood: string;

  // 일기 상세 내용. UI에서 텍스트 에어리어에 작성하는 내용입니다.
  @Prop()
  content: string;
}

export const MoodDiarySchema = SchemaFactory.createForClass(MoodDiary);