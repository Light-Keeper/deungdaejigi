// backend/src/test/test.service.ts

// --- 필요한 모듈 및 클래스 가져오기 (Import) ---
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Test, TestDocument } from './schemas/test.schema';

// --- 서비스 클래스 정의 ---

// @Injectable() 데코레이터는 TestService 클래스가 주입 가능한 Provider임을 선언합니다.
@Injectable()
export class TestService {
  // 생성자에서 Test 모델을 주입받아 이 클래스 내에서 사용할 수 있도록 합니다.
  constructor(@InjectModel(Test.name) private testModel: Model<TestDocument>) {}

  // --- 비즈니스 로직 메소드 ---

  // 'findAll'이라는 비동기 메소드를 정의합니다. test 컬렉션의 모든 문서를 조회합니다.
  async findAll(): Promise<Test[]> {
    // this.testModel.find()는 컬렉션의 모든 문서를 찾는 Mongoose 쿼리입니다.
    // .exec()는 쿼리를 실행하고 Promise를 반환합니다.
    return this.testModel.find().exec();
  }
}
