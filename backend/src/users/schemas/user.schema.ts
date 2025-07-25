// src/users/entities/user.entity.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// UserDocument는 Mongoose의 Document 타입을 확장하여 User 스키마의 인스턴스를 나타냅니다.
export type UserDocument = User & Document;

// @Schema 데코레이터는 이 클래스가 Mongoose 스키마임을 나타냅니다.
@Schema({
  // timestamps: true를 설정하면 createdAt 및 updatedAt 필드가 자동으로 추가됩니다.
  timestamps: true,
  // collection 옵션은 MongoDB에서 사용할 컬렉션 이름을 지정합니다.
  collection: 'users',
})
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: false, unique: true }) // email은 이제 선택 사항입니다.
  email?: string; // 선택 사항이므로 ?를 추가합니다.

  @Prop({ required: true })
  nickname: string;

  @Prop({ required: true, default: '비공개', enum: ['비공개', '남성', '여성'] })
  gender: string; // 예: '남성', '여성', '비공개'

  @Prop({ required: true })
  age: number;

  @Prop({ default: 'user' })
  role: string; // 예: 'admin', 'user' 등
}

// UserSchema는 User 클래스로부터 Mongoose 스키마를 생성합니다.
export const UserSchema = SchemaFactory.createForClass(User);
