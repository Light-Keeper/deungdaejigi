// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './schemas/user.schema';

// @Module 데코레이터는 이 클래스가 NestJS 모듈임을 나타냅니다.
@Module({
  // imports 배열은 이 모듈에서 사용할 다른 모듈을 정의합니다.
  // MongooseModule.forFeature()는 현재 모듈에서 사용할 Mongoose 모델을 등록합니다.
  // User.name은 스키마의 이름을, UserSchema는 해당 스키마 정의를 나타냅니다.
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  // controllers 배열은 이 모듈에 속하는 컨트롤러를 정의합니다.
  controllers: [UsersController],
  // providers 배열은 이 모듈에서 사용할 서비스를 정의합니다.
  providers: [UsersService],
  // exports 배열은 이 모듈에서 제공하고 다른 모듈에서 사용할 수 있도록 내보낼 프로바이더를 정의합니다.
  // UsersService를 내보냄으로써 Auth 모듈에서 UsersService를 주입하여 사용할 수 있습니다.
  exports: [UsersService],
})
export class UsersModule {}
