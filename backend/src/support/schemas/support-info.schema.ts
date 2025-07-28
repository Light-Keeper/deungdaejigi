import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SupportInfoDocument = SupportInfo & Document;

@Schema({ timestamps: true }) // createdAt, updatedAt 필드 자동 생성
export class SupportInfo {
  // 지원 정보의 유형을 '긴급' 또는 '맞춤'으로 제한합니다.
  @Prop({ required: true, enum: ['긴급', '맞춤'] })
  type: string;

  @Prop({ required: true })
  title: string; // 지원 정보의 제목

  @Prop({ required: true })
  description: string; // 지원 정보의 상세 내용

  @Prop()
  eligibility: string; // 지원 대상 (예: "만 19세 이상 34세 이하 돌봄 청년")

  @Prop()
  applicationMethod: string; // 신청 방법 (예: "온라인 신청", "방문 접수")

  @Prop()
  contactInfo: string; // 문의처 정보 (예: "000-0000-0000")

  @Prop()
  link: string; // 관련 웹사이트 링크

  @Prop()
  startDate: Date; // 지원 시작일 (선택 사항)

  @Prop()
  endDate: Date; // 지원 종료일 (선택 사항)
}

export const SupportInfoSchema = SchemaFactory.createForClass(SupportInfo);