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
  // MongoDB의 기본 _id를 사용하므로 별도의 'id' 필드는 정의하지 않습니다.

  // 사용자 로그인 ID 필드입니다. 필수로 고유해야 합니다.
  @Prop({ required: true, unique: true })
  username: string;

  // 이메일 필드입니다. 이제 선택 사항이며 고유하지 않습니다.
  @Prop({ required: false, unique: true }) // email은 이제 선택 사항입니다.
  email?: string; // 선택 사항이므로 ?를 추가합니다.

  // 비밀번호 필드입니다. required: true로 설정되어 있습니다.
  @Prop({ required: true })
  password: string; // 비밀번호는 해싱되어 저장됩니다.

  // 닉네임 필드입니다. required: true로 설정되어 있습니다.
  @Prop({ required: true })
  nickname: string;

  // 성별 필드입니다. 필수입니다.
  @Prop({ required: true })
  gender: string; // 예: 'male', 'female', 'other'

  // 나이 필드입니다. 필수입니다.
  @Prop({ required: true })
  age: number;

  // 사용자 역할 필드입니다. 기본값은 'user'입니다.
  @Prop({ default: 'user' })
  role: string; // 예: 'admin', 'user' 등
}

// UserSchema는 User 클래스로부터 Mongoose 스키마를 생성합니다.
export const UserSchema = SchemaFactory.createForClass(User);
