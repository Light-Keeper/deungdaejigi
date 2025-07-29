// src/posts/schemas/post.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

// MongoDB 'posts' 컬렉션의 스키마를 정의합니다.
// createdAt, updatedAt 필드가 자동으로 추가됩니다.
@Schema({ timestamps: true })
export class Post {
  // 사용자 ID (User 스키마 참조, 필수)
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  // 게시글 제목 (필수)
  @Prop({ required: true })
  title: string;

  // 게시글 내용 (필수)
  @Prop({ required: true })
  content: string;

  // 게시글 카테고리 (필수, 예: '일상', '질문')
  @Prop({ required: true })
  category: string;

  // 작성자 닉네임 (필수, JWT에서 추출)
  // 향후 User 스키마와 통합될 예정입니다.
  @Prop({ required: true })
  authorNickname: string;

  // 좋아요 수 (기본값: 0)
  @Prop({ default: 0 })
  likeCount: number;

  // 댓글 수 (기본값: 0)
  // 댓글 생성/삭제 시 자동 업데이트될 예정입니다.
  @Prop({ default: 0 })
  commentCount: number;

  // Mongoose가 자동으로 관리하는 생성/수정 일자
  createdAt: Date;
  updatedAt: Date;
}

// Post 문서의 타입을 정의합니다.
export type PostDocument = HydratedDocument<Post>;

// Post 클래스로부터 Mongoose 스키마 객체를 생성합니다.
export const PostSchema = SchemaFactory.createForClass(Post);
