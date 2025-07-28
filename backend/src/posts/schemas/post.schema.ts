// src/posts/schemas/post.schema.ts

/**
 * 🗄️ 게시글 스키마 - JWT 인증 적용 버전
 * 
 * 🎯 역할:
 * - MongoDB의 'posts' 컬렉션 구조 정의
 * - 데이터 타입과 제약 조건 설정
 * - 자동 필드 생성 및 관계 설정
 * 
 * 🔄 JWT 적용 후 변경사항:
 * - userId 필드 추가: User 스키마와의 관계 설정
 * - 보안 강화: 실제 사용자 ID로 작성자 추적 가능
 */

// 필요한 Mongoose 데코레이터 및 타입들 가져오기
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

/**
 * 🏷️ @Schema 데코레이터:
 * 이 클래스를 MongoDB 컬렉션 스키마로 정의
 * 
 * ⚙️ 옵션 설명:
 * - timestamps: true → createdAt, updatedAt 필드 자동 생성 및 관리
 * 
 * 📊 실제 MongoDB 컬렉션명: 'posts' (Post → posts로 자동 변환)
 */
@Schema({ timestamps: true })
export class Post {
  /**
   * 🆔 사용자 ID 필드 (JWT 인증 적용으로 새로 추가)
   * 
   * 🔒 보안 강화 목적:
   * - 게시글 작성자를 명확하게 식별
   * - JWT 토큰에서 추출한 신뢰할 수 있는 사용자 ID 저장
   * - 향후 권한 검증 시 사용 (수정/삭제 권한 확인)
   * 
   * ⚙️ 필드 설정:
   * @Prop({
   *   type: Types.ObjectId,    // MongoDB ObjectId 타입
   *   ref: 'User',            // User 컬렉션과의 관계 설정 (populate 시 사용)
   *   required: true          // 필수 필드 (없으면 저장 실패)
   * })
   * 
   * 💡 관계형 설정 설명:
   * - ref: 'User' → users 컬렉션의 문서와 연결
   * - 향후 populate()로 사용자 전체 정보 조회 가능
   * - 예: post.populate('userId') → 사용자 nickname, email 등 조회
   */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  /**
   * 📝 게시글 제목
   * 
   * ⚙️ 필드 설정:
   * - required: true → 필수 입력 필드
   * - 타입: string
   * 
   * 💡 실제 저장 예시: "JWT 인증 게시글"
   */
  @Prop({ required: true })
  title: string;

  /**
   * 📄 게시글 내용
   * 
   * ⚙️ 필드 설정:
   * - required: true → 필수 입력 필드
   * - 타입: string
   * 
   * 💡 실제 저장 예시: "JWT 토큰을 사용해서 게시글을 작성했습니다!"
   */
  @Prop({ required: true })
  content: string;

  /**
   * 🏷️ 게시글 카테고리
   * 
   * ⚙️ 필드 설정:
   * - required: true → 필수 입력 필드
   * - 타입: string
   * 
   * 💡 실제 저장 예시: "일상", "질문", "공지", "기술" 등
   * 
   * 📋 향후 개선 방안:
   * - enum으로 허용되는 카테고리 제한
   * - 별도 Category 컬렉션으로 분리
   */
  @Prop({ required: true })
  category: string;

  /**
   * 👤 작성자 닉네임 (임시 필드)
   * 
   * 🔄 현재 상태:
   * - JWT에서 추출한 username을 임시로 저장
   * - 직접 입력이 아닌, 토큰에서 추출한 신뢰할 수 있는 값
   * 
   * 📋 향후 개선 계획:
   * 1. User 스키마에 nickname 필드 추가
   * 2. populate()로 실시간 nickname 조회
   * 3. 이 필드는 제거하고 userId만 사용
   * 
   * 💡 현재 저장 예시: "testuser" (JWT의 username)
   */
  @Prop({ required: true })
  authorNickname: string;

  /**
   * 👍 좋아요 수
   * 
   * ⚙️ 필드 설정:
   * - default: 0 → 게시글 생성 시 자동으로 0으로 설정
   * - 타입: number
   * 
   * 🔄 관련 기능:
   * - 향후 POST /posts/:id/like API 구현 예정
   * - 증감 로직: { $inc: { likeCount: 1 } }
   */
  @Prop({ default: 0 })
  likeCount: number;

  /**
   * 💬 댓글 수
   * 
   * ⚙️ 필드 설정:
   * - default: 0 → 게시글 생성 시 자동으로 0으로 설정
   * - 타입: number
   * 
   * 🔄 관련 기능:
   * - 향후 댓글 생성/삭제 시 자동 업데이트
   * - Comment 스키마와 연동 예정
   */
  @Prop({ default: 0 })
  commentCount: number;

  /**
   * 📅 자동 생성 필드들 (timestamps: true 옵션으로 자동 추가)
   * 
   * 🔄 Mongoose가 자동으로 관리:
   * - createdAt: Date → 문서 생성 시점
   * - updatedAt: Date → 문서 수정 시점
   * 
   * 💡 실제 사용 예시:
   * - 게시글 목록에서 "5분 전", "1시간 전" 표시
   * - 수정된 게시글 표시 (createdAt !== updatedAt)
   */
}

/**
 * 🔍 PostDocument 타입 정의
 * 
 * 💡 용도:
 * - MongoDB에서 조회한 Post 문서의 완전한 타입
 * - Mongoose가 제공하는 메서드들 포함 (save, remove, populate 등)
 * - PostsService에서 반환 타입으로 사용
 * 
 * 🔄 HydratedDocument<Post>의 의미:
 * - Post 스키마 + Mongoose 문서 메서드 + MongoDB 메타데이터
 * - _id, __v, createdAt, updatedAt 등 자동 필드 포함
 */
export type PostDocument = HydratedDocument<Post>;

/**
 * 🏭 PostSchema 생성
 * 
 * 🔄 SchemaFactory.createForClass(Post) 동작:
 * 1. Post 클래스의 @Prop 데코레이터 정보 수집
 * 2. MongoDB 스키마 객체 생성
 * 3. 인덱스, 제약조건, 미들웨어 등 설정 적용
 * 
 * 📊 생성된 스키마는 다음에서 사용:
 * - posts.module.ts: MongooseModule.forFeature()에서 등록
 * - MongoDB: 실제 컬렉션 구조 정의로 사용
 * 
 * 💡 향후 추가 가능한 설정:
 * PostSchema.index({ title: 'text', content: 'text' }); // 텍스트 검색
 * PostSchema.index({ userId: 1, createdAt: -1 });      // 사용자별 최신순
 * PostSchema.index({ category: 1 });                   // 카테고리별 조회
 */
export const PostSchema = SchemaFactory.createForClass(Post);