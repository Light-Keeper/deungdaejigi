// backend/src/auth/auth.service.ts

import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterUserDto, LoginUserDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * 새로운 사용자를 등록(회원가입)합니다.
   */
  async register(registerUserDto: RegisterUserDto): Promise<User> {
    // 1. 아이디 중복 확인
    const existingUserByUsername = await this.usersService.findByUsername(
      registerUserDto.username,
    );
    if (existingUserByUsername) {
      throw new ConflictException('이미 사용 중인 아이디입니다.');
    }

    // 2. 이메일이 제공된 경우, 이메일 중복 확인
    if (registerUserDto.email) {
      const existingUserByEmail = await this.usersService.findByEmail(
        registerUserDto.email,
      );
      if (existingUserByEmail) {
        throw new ConflictException('이미 등록된 이메일입니다.');
      }
    }

    // 3. 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);

    // 4. 암호화된 비밀번호로 교체하여 사용자 생성 요청
    return this.usersService.create({
      ...registerUserDto,
      password: hashedPassword,
    });
  }

  /**
   * 사용자를 로그인 처리하고 JWT 토큰을 발급합니다.
   */
  async login(loginUserDto: LoginUserDto) {
    const user = await this.usersService.findByUsername(loginUserDto.username);

    if (user && (await bcrypt.compare(loginUserDto.password, user.password))) {
      const payload = { username: user.username, sub: user._id };
      return {
        accessToken: this.jwtService.sign(payload),
      };
    }

    throw new UnauthorizedException(
      '아이디 또는 비밀번호가 올바르지 않습니다.',
    );
  }
}
