import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

/**
 * 복지 정보 스키마 정의
 *
 * @property {string} sourceType          - 데이터 출처   (예: 중앙부처, 지방자치단체, 민간기관 등)
 * @property {string} serviceName         - 복지 이름     (예 : 긴급돌봄 지원사업)
 * @property {string} serviceId           - 복지 서비스 ID(예: WLF00005442)
 * @property {string} description         - 서비스 설명   (예 : 질병, 부상, 주 돌봄자의 갑작스러운 부재(사망, 입원 등) 등에 대응해 돌봄 공백을 신속히 보완해 국민의 돌봄불안을 해소합니다.)
 * @property {string[]} provider          - 복지 제공자   (예 : ["보건복지부 사회서비스사업과"])
 * @property {string[]} targetAudience    - 지원대상      (예 : ["다자녀", "저소득층", "장애인", "여성", "아동", "청소년", "청년", "중장년", "다문화가족"] or "undefined")
 * @property {string[]} lifeCycle         - 신청대상 생애주기 (예: ["영유아", "아동", "청소년", "청년", "중장년", "노년", "임신·출산"])
 * @property {string[]} serviceCategory   - 서비스 분류   (예 : ["일자리", "주거", "복지", "문화", "교육", "건강", "안전"])
 * @property {string} contact             - 문의처        (예 : 1522-0365 )
 * @property {string} serviceURL          - 서비스 URL    (예 : https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00005442&wlfareInfoReldBztpCd=01)
 * @property {Date} lastUpdated           - 데이터 마지막 업데이트 날짜 (예 : 2023-10-01T00:00:00.000Z)
 */
@Schema({ timestamps: true, collection: 'welfare' })
export class Welfare {
  @Prop({ required: true })
  sourceType: string; // 데이터 출처 (예: 중앙부처, 지방자치단체, 민간기관 등)

  @Prop({ required: true })
  serviceName: string; // 복지 이름

  @Prop({ required: true, unique: true })
  serviceId: string; // 복지 서비스 ID (고유 식별자)

  @Prop({ required: true })
  description: string; // 서비스 설명

  @Prop({ default: [] })
  provider: string[]; // 복지 제공자 (복수)

  @Prop({ default: [] })
  targetAudience: string[]; // 지원대상 (복수) (예 : ["다자녀", "저소득층", "장애인", "여성", "아동", "청소년", "청년", "중장년", "다문화가족"] or "undefined")

  @Prop({ default: [] })
  lifeCycle: string[]; // 신청대상 생애주기 (복수) (예: ["영유아", "아동", "청소년", "청년", "중장년", "노년"])

  @Prop({ default: [null] })
  serviceCategory: string[]; // 서비스 분류 (예: ["일자리", "주거", "복지", "문화", "교육", "건강", "안전"])

  @Prop({ default: null })
  contact: string; // 연락처

  @Prop({ default: null })
  serviceURL: string; // 신청 사이트 URL

  @Prop({ type: Date, default: null })
  lastUpdated: Date; // 데이터 마지막 업데이트 날짜
}

export type WelfareDocument = HydratedDocument<Welfare>;
export const WelfareSchema = SchemaFactory.createForClass(Welfare);
