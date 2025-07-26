import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// --- 1. 방금 만든 TestModule을 가져옵니다. ---
import { TestModule } from '../test/test.module';
import { WelfareModule } from './welfare/welfare.module';

// AppModule은 NestJS 애플리케이션의 루트 모듈로, 다른 모듈들을 가져오고 설정합니다.
// 이 모듈은 .env 파일을 읽고 MongoDB에 연결하는 설정을 포함합니다.
@Module({
  imports: [
    // 1. .env 파일을 읽기 위한 ConfigModule 설정
    ConfigModule.forRoot({
      isGlobal: true, // 모든 모듈에서 .env 변수를 사용할 수 있게 함
    }),

    // 2. MongoDB 연결 설정
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    // --- 2. imports 배열에 TestModule을 추가합니다. ---
    TestModule,
    WelfareModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
