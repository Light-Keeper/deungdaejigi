// src/comments/schemas/comments.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Post } from '../../posts/schemas/post.schema';

// MongoDB 'comments' 컬렉션의 스키마를 정의합니다.
// createdAt, updatedAt 필드가 자동으로 추가됩니다.
@Schema({ timestamps: true })
export class Comment {
  // 댓글이 속한 게시글의 ID (Post 스키마 참조, 필수)
  @Prop({ type: Types.ObjectId, ref: 'Post', required: true })
  postId: Types.ObjectId;

  // 댓글 내용 (필수)
  @Prop({ required: true })
  content: string;

  // 댓글 작성자의 닉네임 (필수)
  // 익명일 경우 클라이언트에 노출되지 않습니다.
  @Prop({ required: true })
  authorNickname: string;

  // 익명 여부 (true: 익명, false: 닉네임 노출, 기본값: false)
  @Prop({ default: false })
  isAnonymous: boolean;

  // Mongoose가 자동으로 관리하는 생성/수정 일자
  createdAt: Date;
  updatedAt: Date;
}

// Comment 문서의 타입을 정의합니다.
export type CommentDocument = HydratedDocument<Comment>;

// Comment 클래스로부터 Mongoose 스키마 객체를 생성합니다.
export const CommentSchema = SchemaFactory.createForClass(Comment);
