// backend/src/auth/auth.controller.ts

import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto, LoginUserDto } from './dto/auth.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from 'src/users/schemas/user.schema';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: '회원가입',
    description: '새로운 사용자를 등록합니다.',
  })
  @ApiResponse({ status: 201, description: '회원가입 성공', type: User })
  @ApiResponse({ status: 409, description: '아이디 또는 이메일 중복' })
  register(@Body() registerUserDto: RegisterUserDto): Promise<User> {
    return this.authService.register(registerUserDto);
  }

  @Post('login')
  @ApiOperation({
    summary: '로그인',
    description: '로그인 후 JWT 토큰을 발급합니다.',
  })
  @ApiResponse({ status: 200, description: '로그인 성공 및 토큰 발급' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }
}
