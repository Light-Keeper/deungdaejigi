// src/users/users.service.ts
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { RegisterUserDto } from '../auth/dto/auth.dto';

@Injectable()
export class UsersService {
  // User 모델을 주입하여 데이터베이스와 상호작용합니다.
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  /**
   * 새로운 사용자를 생성합니다.
   * @param createUserDto 사용자 생성에 필요한 데이터 (username, email, password, nickname, gender, age)
   * @returns 생성된 사용자 문서
   */
  async create(registerUserDto: RegisterUserDto): Promise<User> {
    const createdUser = new this.userModel({
      ...registerUserDto,
    });

    // 데이터베이스에 사용자 저장 및 반환
    return createdUser.save();
  }

  /**
   * 모든 사용자를 조회합니다.
   * @returns 모든 사용자 문서 배열
   */
  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  /**
   * 사용자 이름(username)으로 사용자를 조회합니다.
   * 인증 모듈에서 로그인 시 사용될 수 있습니다.
   * @param username 사용자 로그인 ID
   * @returns 조회된 사용자 문서 또는 null
   */
  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).exec();
  }

  /**
   * ID로 사용자를 조회합니다. (MongoDB의 _id 기준)
   * @param id MongoDB 문서 ID
   * @returns 조회된 사용자 문서
   */
  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`ID가 ${id}인 사용자를 찾을 수 없습니다.`);
    }
    return user;
  }

  /**
   * 이메일로 사용자를 조회합니다. (이메일이 있는 경우)
   * @param email 사용자 이메일
   * @returns 조회된 사용자 문서 또는 null
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }
}
