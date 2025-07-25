// src/users/users.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterUserDto } from '../auth/dto/auth.dto'; // 사용자 생성에 필요한 DTO
import { User } from './schemas/user.schema';

// @Controller 데코레이터는 이 클래스가 컨트롤러임을 나타내며, 'users' 경로를 처리합니다.
@Controller('users')
export class UsersController {}
