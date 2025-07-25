// backend/src/posts/schemas/post.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
// import { User } from '../users/schemas/user.schema';

@Schema({ timestamps: true })
export class Post {
  // 💡 작성자 정보를 User 스키마와 연결합니다.
  // type: Types.ObjectId는 이 필드가 다른 문서의 고유 ID임을 나타냅니다.
  // ref: 'User'는 이 ID가 'User'라는 이름의 모델을 참조한다는 의미입니다.
  //@TODO: Users 모듈 main 브랜치에 병합하면 이 주석 제거
  // @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  // author: User;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  // 💡 해시태그는 여러 개일 수 있으므로, 문자열의 배열([String])로 타입을 지정합니다.
  @Prop({ type: [String] })
  hashtags: string[];

  // 💡 default: 0 옵션은 데이터가 처음 생성될 때 이 필드의 기본값을 0으로 설정합니다.
  @Prop({ default: 0 })
  likeCount: number;

  @Prop({ default: 0 })
  commentCount: number;
}

export type PostDocument = HydratedDocument<Post>;
export const PostSchema = SchemaFactory.createForClass(Post);
