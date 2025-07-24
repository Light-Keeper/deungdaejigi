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
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/user.schema';

// @Controller 데코레이터는 이 클래스가 컨트롤러임을 나타내며, 'users' 경로를 처리합니다.
@Controller('users')
export class UsersController {
  // UsersService를 주입하여 사용자 관련 비즈니스 로직을 처리합니다.
  constructor(private readonly usersService: UsersService) {}

  /**
   * 새로운 사용자를 생성합니다. (회원가입)
   * POST /users
   * @param createUserDto 사용자 생성 데이터
   * @returns 생성된 사용자 정보
   */
  @Post()
  // @HttpCode(HttpStatus.CREATED)는 성공 시 201 Created 상태 코드를 반환하도록 설정합니다.
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    // UsersService의 create 메서드를 호출하여 사용자를 생성합니다.
    return this.usersService.create(createUserDto);
  }

  /**
   * 모든 사용자를 조회합니다.
   * GET /users
   * @returns 모든 사용자 정보 배열
   */
  @Get()
  async findAll(): Promise<User[]> {
    // UsersService의 findAll 메서드를 호출하여 모든 사용자를 조회합니다.
    return this.usersService.findAll();
  }

  /**
   * 특정 ID의 사용자를 조회합니다.
   * GET /users/:id
   * @param id 사용자 ID (string 타입)
   * @returns 특정 사용자 정보
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    // findOne 대신 findById를 사용하고, +id 대신 id를 직접 사용합니다.
    return this.usersService.findById(id);
  }

  /**
   * 특정 ID의 사용자를 업데이트합니다.
   * PATCH /users/:id
   * @param id 사용자 ID (string 타입)
   * @param updateUserDto 업데이트할 사용자 데이터
   * @returns 업데이트된 사용자 정보
   */
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    // +id 대신 id를 직접 사용합니다.
    return this.usersService.update(id, updateUserDto);
  }

  /**
   * 특정 ID의 사용자를 삭제합니다.
   * DELETE /users/:id
   * @param id 사용자 ID (string 타입)
   * @returns 삭제된 사용자 정보
   */
  @Delete(':id')
  // @HttpCode(HttpStatus.NO_CONTENT)는 성공 시 204 No Content 상태 코드를 반환하도록 설정합니다.
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<User> {
    // +id 대신 id를 직접 사용합니다.
    return this.usersService.remove(id);
  }
}
