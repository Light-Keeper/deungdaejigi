import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true, collection: 'welfare' })
export class Welfare {
  @Prop({ required: true })
  name: string; // 복지 이름

  @Prop({ required: true })
  provider: string; // 복지 제공자

  @Prop({ required: true })
  description: string; // 복지에 대한 설명

  @Prop({ required: true })
  eligibility: string; // 지원자격

  @Prop({ required: true })
  applicationMethod: string; // 신청방법

  @Prop({ type: [String], default: [] })
  requiredDocuments: string[]; // 구비서류

  @Prop()
  contact: string; // 연락처

  @Prop()
  applicationUrl: string; // 신청 사이트 URL

  @Prop({ required: true })
  mainCategory: string; // 대분류

  @Prop({ required: true })
  subCategory: string; // 소분류

  @Prop({ type: Date })
  applicationStartDate: Date; // 신청 시작일

  @Prop({ type: Date })
  applicationEndDate: Date; // 신청 마감일
}

export type WelfareDocument = HydratedDocument<Welfare>;
export const WelfareSchema = SchemaFactory.createForClass(Welfare);
