import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'; // Swagger 관련 모듈 임포트
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- Swagger 설정 시작 ---
  const config = new DocumentBuilder()
    .setTitle('복지 정보 API') // API 문서의 제목
    .setDescription('복지 정보 동기화 및 제공을 위한 API 문서입니다.') // API 문서 설명
    .setVersion('1.0') // API 버전
    .addTag('welfare') // 특정 컨트롤러 그룹에 태그를 추가하여 문서화
    // .addBearerAuth() // JWT 등의 Bearer 토큰 인증 방식 추가 (필요시)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document); // 'api-docs' 경로에서 Swagger UI 접근 가능
  // --- Swagger 설정 끝 ---
 await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger UI is available at: ${await app.getUrl()}/api-docs`);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 정의되지 않은 속성은 자동으로 제거합니다.
      forbidNonWhitelisted: true, // DTO에 정의되지 않은 속성이 들어오면 에러를 발생시킵니다.
      transform: true, // 요청 데이터를 DTO 타입으로 자동 변환해줍니다.
    }),
  );


  SwaggerModule.setup('api-docs', app, document);

 
}

// bootstrap 함수를 호출하여 애플리케이션을 실행합니다.
bootstrap();
