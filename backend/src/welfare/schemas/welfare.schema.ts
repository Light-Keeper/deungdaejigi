import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, now } from 'mongoose';

/**
 * 복지 정보 스키마 정의
 *
 * @property {string} sourceType          - 데이터 출처   (예: 중앙부처, 지방자치단체, 민간단체 등)
 * @property {string} serviceId           - 복지 서비스 ID(예: WLF00005442)
 * @property {string} serviceName         - 복지 이름     (예 : 긴급돌봄 지원사업)
 * @property {string} provider            - 복지 제공자   (예 : ["보건복지부 사회서비스사업과"])
 * @property {string} description         - 서비스 설명   (예 : 질병, 부상, 주 돌봄자의 갑작스러운 부재(사망, 입원 등) 등에 대응해 돌봄 공백을 신속히 보완해 국민의 돌봄불안을 해소합니다.)
 * @property {string[]} targetAudience    - 지원대상      (예 : ["다자녀", "저소득층", "장애인", "여성", "아동", "청소년", "청년", "중장년", "다문화가족"] or "undefined")
 * @property {string[]} lifeCycle         - 생애주기 (예: ["영유아", "아동", "청소년", "청년", "중장년", "노년", "임신·출산"])
 * @property {string[]} serviceCategory   - 서비스 분류   (예 : ["일자리", "주거", "복지", "문화", "교육", "건강", "안전"])
 * @property {string} contact             - 문의처        (예 : 1522-0365 )
 */
@Schema({ timestamps: true, collection: 'welfare' })
export class Welfare {
  /// ================ 공통 속성 시작 ===================
  @Prop({ required: true, enum: ['중앙부처', '지자체', '민간단체'] })
  sourceType: string; // 데이터 출처 (예: 중앙부처, 지방자치단체, 민간단체 등)

  @Prop({ required: true, unique: true })
  serviceId: string; // 복지 서비스 ID (고유 식별자)

  @Prop({ required: true })
  serviceName: string; // 복지 이름

  @Prop({ default: null })
  provider: string; // 복지 제공자 (복수)

  @Prop({ default: null })
  description: string; // 서비스 설명 또는 신청 방법

  @Prop({ default: [] })
  targetAudience: string[]; // 지원대상 (복수) (예 : ["다자녀", "저소득층", "장애인", "여성", "아동", "청소년", "청년", "중장년", "다문화가족"] or "undefined")

  @Prop({ default: [] })
  lifeCycle: string[]; // 신청대상 생애주기 (복수) (예: ["영유아", "아동", "청소년", "청년", "중장년", "노년"])

  @Prop({ default: [] })
  serviceCategory: string[]; // 서비스 분류 (예: ["일자리", "주거", "복지", "문화", "교육", "건강", "안전"])

  @Prop({ default: null })
  contact: string;

  @Prop({ default: null })
  supportCycleName: string; // 지원 주기

  @Prop({ default: null })
  serviceProvisionName: string; // 지급 방식

  @Prop({ default: null })
  serviceURL: string; // 서비스 상세링크
  /// ================= 공통 속성 끝 =================

  /// ================= 고유 속성 시작 =================

  /// ================= 중앙부처 고유 속성 시작 =================

  @Prop({ default: false })
  onlineApplicationAvailable: boolean; // 온라인신청가능여부

  /// ================= 중앙부처 고유 속성 끝 =================

  /// ================= 민간 고유 속성 시작 =================

  @Prop({ default: null })
  applicationMethod: string; // 신청방법

  @Prop({ default: null })
  requiredDocs: string; // 제출서류

  @Prop({ type: Date, default: null })
  businessStartDate; // 사업시작일

  @Prop({ type: Date, default: null })
  businessEndDate; // 사업종료일

  /// ================= 민간 고유 속성 끝 =================

  /// ================= 지자체 고유 속성 시작 =================

  @Prop({ default: null })
  serviceAreaName: string; // 서비스 제공 지역

  @Prop({ default: null })
  cityProvinceName: string; // 서비스 제공 시/도

  /// ================= 지자체 고유 속성 끝 =================

  /// ================= 고유 속성 끝 =================
}

export type WelfareDocument = HydratedDocument<Welfare>;
export const WelfareSchema = SchemaFactory.createForClass(Welfare);
