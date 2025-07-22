// backend/src/test/schemas/test.schema.ts

// --- 필요한 모듈 및 클래스 가져오기 (Import) ---

// Prop, Schema, SchemaFactory 데코레이터를 @nestjs/mongoose 패키지에서 가져옵니다.
// 이 데코레이터들은 Mongoose 스키마를 Nest.js 방식으로 쉽게 생성하도록 도와줍니다.
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// Mongoose 라이브러리에서 HydratedDocument 타입을 가져옵니다.
// 이는 데이터베이스에서 조회한 문서 객체의 타입을 나타냅니다.
import { HydratedDocument } from 'mongoose';

// --- 스키마 클래스 정의 ---

// @Schema() 데코레이터는 Test 클래스가 데이터베이스의 'tests' 컬렉션과 매핑되는 스키마임을 선언합니다.
// Mongoose는 기본적으로 클래스 이름(Test)을 소문자 복수형(tests)으로 바꿔 컬렉션 이름으로 사용합니다.
@Schema()
// Test 클래스를 선언합니다. 이 클래스의 구조가 곧 문서(document)의 구조가 됩니다.
export class Test {
  // @Prop() 데코레이터는 이 속성이 데이터베이스 문서의 필드임을 나타냅니다.
  // Compass 스크린샷에 있는 'result' 필드와 정확히 일치하도록 속성 이름을 'result'로 지정합니다.
  @Prop()
  // result 필드를 문자열(string) 타입으로 선언합니다.
  result: string;

  // @Prop() 데코레이터로 'test' 필드를 선언합니다.
  // Compass 스크린샷에 있는 'test' 필드와 정확히 일치하도록 속성 이름을 'test'로 지정합니다.
  @Prop()
  // test 필드를 문자열(string) 타입으로 선언합니다.
  test: string;

  // _id 필드는 Mongoose가 자동으로 생성하고 관리하므로, 스키마 클래스에 따로 정의할 필요가 없습니다.
}

// --- 타입 및 스키마 생성 ---

// TestDocument 타입을 정의합니다.
// HydratedDocument<Test>와 같으며, 데이터베이스에서 조회한 Test 문서 객체의 타입을 나타냅니다.
export type TestDocument = HydratedDocument<Test>;

// SchemaFactory.createForClass(Test)를 사용하여 Test 클래스로부터 Mongoose 스키마 객체를 생성합니다.
// 이 스키마 객체는 test.module.ts에서 MongooseModule에 등록하는 데 사용됩니다.
export const TestSchema = SchemaFactory.createForClass(Test);
