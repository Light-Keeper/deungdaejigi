// backend/src/test/test.module.ts

// --- 필요한 모듈 및 클래스 가져오기 (Import) ---
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestSchema } from './schemas/test.schema';
import { TestController } from './test.controller';
import { TestService } from './test.service';

// --- 모듈 클래스 정의 ---

// @Module() 데코레이터는 TestModule 클래스가 Nest.js 모듈임을 선언합니다.
@Module({
  // MongooseModule.forFeature()를 사용하여 이 모듈 내에서 사용할 스키마를 등록합니다.
  // 이렇게 해야 Test 모델을 서비스에 주입할 수 있습니다.
  imports: [
    MongooseModule.forFeature([{ name: Test.name, schema: TestSchema }]),
  ],
  // 이 모듈에서 사용할 컨트롤러들을 등록합니다.
  controllers: [TestController],
  // 이 모듈에서 사용할 프로바이더(서비스 등)들을 등록합니다.
  providers: [TestService],
})
export class TestModule {}
