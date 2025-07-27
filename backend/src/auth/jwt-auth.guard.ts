// backend/src/auth/jwt-auth.guard.ts

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT 인증을 위한 가드(Guard)입니다.
 * 이 가드는 @nestjs/passport의 AuthGuard를 상속받아 'jwt' 전략을 사용합니다.
 * 컨트롤러의 특정 경로에 @UseGuards(JwtAuthGuard) 데코레이터를 붙이면,
 * 해당 경로는 유효한 JWT 토큰을 가진 요청만 통과시킬 수 있게 됩니다.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
