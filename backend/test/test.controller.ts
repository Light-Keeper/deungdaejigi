// backend/src/test/test.controller.ts

// --- 필요한 모듈 및 클래스 가져오기 (Import) ---
import { Controller, Get } from '@nestjs/common';
import { TestService } from './test.service';

// --- 컨트롤러 클래스 정의 ---

// @Controller('test') 데코레이터는 이 컨트롤러의 기본 경로를 '/test'로 설정합니다.
@Controller('test')
export class TestController {
  // 생성자에서 TestService를 주입받아 사용합니다.
  constructor(private readonly testService: TestService) {}

  // --- API 엔드포인트 메소드 ---

  // @Get() 데코레이터는 HTTP GET 요청을 이 메소드와 연결합니다.
  // 최종 경로는 '/test'가 됩니다.
  @Get()
  findAll() {
    // TestService의 findAll 메소드를 호출하여 결과를 반환합니다.
    return this.testService.findAll();
  }
}
