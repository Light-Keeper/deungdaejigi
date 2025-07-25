// backend/src/auth/jwt.strategy.ts

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  /**
   * 토큰 검증 성공 후 호출됩니다.
   * 여기서 반환된 값은 요청(Request) 객체의 user 속성에 저장됩니다.
   */
  async validate(payload: any) {
    // payload: { username: '...', sub: '...' }
    return { userId: payload.sub, username: payload.username };
  }
}
