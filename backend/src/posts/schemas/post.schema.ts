// --- 필요한 모듈 및 클래스 가져오기 (Import) ---

// Prop, Schema, SchemaFactory 데코레이터를 @nestjs/mongoose 패키지에서 가져옵니다.
// 이 데코레이터들은 Mongoose 스키마를 Nest.js 방식으로 쉽게 생성하도록 도와줍니다.
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// Mongoose 라이브러리에서 HydratedDocument와 Types를 가져옵니다.
// HydratedDocument는 Mongoose가 데이터베이스에서 조회한 문서에 메소드 등을 추가한 객체의 타입입니다.
// Types는 ObjectId와 같은 Mongoose의 특별한 데이터 타입을 사용하기 위해 필요합니다.
import { HydratedDocument, Types } from 'mongoose';

// --- 스키마 클래스 정의 ---

// @Schema() 데코레이터는 Post 클래스가 데이터베이스의 'posts' 컬렉션과 매핑되는 스키마임을 선언합니다.
// { timestamps: true } 옵션은 데이터가 생성되거나 업데이트될 때 자동으로 createdAt과 updatedAt 필드를 추가해줍니다.
@Schema({ timestamps: true })
// Post 클래스를 선언합니다. 이 클래스의 구조가 곧 문서(document)의 구조가 됩니다.
export class Post {
  // @Prop() 데코레이터는 이 속성(property)이 데이터베이스 문서의 필드(field)임을 나타냅니다.
  // required: true 옵션은 이 필드가 필수 값임을 의미합니다.
  @Prop({ required: true })
  // title 필드를 문자열(string) 타입으로 선언합니다.
  title: string;

  // @Prop() 데코레이터로 content 필드를 선언합니다.
  @Prop({ required: true })
  // content 필드를 문자열(string) 타입으로 선언합니다.
  content: string;

  // @Prop() 데코레이터로 category 필드를 선언합니다.
  @Prop({ required: true })
  // category 필드를 문자열(string) 타입으로 선언합니다. (예: 'daily', 'question')
  category: string;

  // @Prop() 데코레이터로 authorNickname 필드를 선언합니다.
  // 💡 중요: 현재는 인증 기능이 없으므로, 작성자 정보를 임시 닉네임(문자열)으로 받습니다.
  // 2주차에 User 스키마와 연결할 때 이 부분은 아래와 같이 수정될 예정입니다.
  // @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  // author: Types.ObjectId;
  @Prop({ required: true })
  // authorNickname 필드를 문자열(string) 타입으로 선언합니다.
  authorNickname: string;

  // @Prop() 데코레이터로 likeCount 필드를 선언합니다.
  // default: 0 옵션은 데이터가 처음 생성될 때 이 필드의 기본값을 0으로 설정합니다.
  @Prop({ default: 0 })
  // likeCount 필드를 숫자(number) 타입으로 선언합니다.
  likeCount: number;

  // @Prop() 데코레이터로 commentCount 필드를 선언합니다.
  @Prop({ default: 0 })
  // commentCount 필드를 숫자(number) 타입으로 선언합니다.
  commentCount: number;

  // (Mongoose가 자동으로 추가해 줄 필드들)
  // createdAt: Date; // 데이터 생성 일자
  // updatedAt: Date; // 데이터 수정 일자
}

// --- 타입 및 스키마 생성 ---

// PostDocument 타입을 정의합니다.
// 이는 HydratedDocument<Post>와 같으며, 데이터베이스에서 조회한 Post 문서 객체의 타입을 나타냅니다.
export type PostDocument = HydratedDocument<Post>;

// SchemaFactory.createForClass(Post)를 사용하여 Post 클래스로부터 Mongoose 스키마 객체를 생성합니다.
// 이 스키마 객체는 posts.module.ts에서 MongooseModule에 등록하는 데 사용됩니다.
export const PostSchema = SchemaFactory.createForClass(Post);
