// backend/src/auth/dto/auth.dto.ts

import {
  IsString,
  IsEmail,
  IsNumber,
  IsOptional,
  MinLength,
  IsIn,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 회원가입 시 클라이언트로부터 받을 데이터의 구조와 규칙을 정의합니다.
 */
export class RegisterUserDto {
  @ApiProperty({
    example: 'deungdaejigi123',
    description: '사용자 아이디 (로그인 ID)',
  })
  @IsString()
  username: string;

  @ApiProperty({
    example: 'password1234',
    description: '비밀번호 (최소 8자 이상)',
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    example: 'optional.email@example.com',
    description: '이메일 주소 (선택 사항)',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '등대지기', description: '사용자 닉네임' })
  @IsString()
  nickname: string;

  @ApiProperty({
    example: '여성',
    description: "성별 ('비공개', '남성', '여성' 중 하나)",
  })
  @IsIn(['비공개', '남성', '여성'])
  gender: string;

  @ApiProperty({ example: 25, description: '나이' })
  @IsNumber()
  age: number;
}

/**
 * 로그인 시 클라이언트로부터 받을 데이터의 구조와 규칙을 정의합니다.
 */
export class LoginUserDto {
  @ApiProperty({
    example: 'deungdaejigi123',
    description: '사용자 아이디 (로그인 ID)',
  })
  @IsString()
  username: string;

  @ApiProperty({
    example: 'password1234',
    description: '비밀번호',
  })
  @IsString()
  password: string;
}
