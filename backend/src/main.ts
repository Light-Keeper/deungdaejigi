import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 정의되지 않은 속성은 자동으로 제거합니다.
      forbidNonWhitelisted: true, // DTO에 정의되지 않은 속성이 들어오면 에러를 발생시킵니다.
      transform: true, // 요청 데이터를 DTO 타입으로 자동 변환해줍니다.
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('등대지기 API 명세서') // 문서의 제목을 설정합니다.
    .setDescription('가족돌봄청년 통합 지원 플랫폼 등대지기 API 문서입니다.') // 문서에 대한 설명을 추가합니다.
    .setVersion('1.0') // API 버전을 설정합니다.
    .addBearerAuth() // 💡 JWT Bearer 인증을 사용할 수 있도록 UI에 자물쇠 버튼을 추가합니다.
    .build(); // 설정을 빌드하여 최종 config 객체를 생성합니다.

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api-docs', app, document);

  await app.listen(3000);
}

// bootstrap 함수를 호출하여 애플리케이션을 실행합니다.
bootstrap();
