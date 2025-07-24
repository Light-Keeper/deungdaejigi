// src/users/users.service.ts
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt'; // 비밀번호 해싱을 위한 bcrypt 라이브러리

@Injectable()
export class UsersService {
  // User 모델을 주입하여 데이터베이스와 상호작용합니다.
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  /**
   * 새로운 사용자를 생성합니다.
   * @param createUserDto 사용자 생성에 필요한 데이터 (username, email, password, nickname, gender, age)
   * @returns 생성된 사용자 문서
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // username 중복 확인
    const existingUserByUsername = await this.userModel.findOne({ username: createUserDto.username }).exec();
    if (existingUserByUsername) {
      // 이미 존재하는 username인 경우 ConflictException을 발생시킵니다.
      throw new ConflictException('이미 사용 중인 사용자 ID입니다.');
    }

    // email이 제공된 경우 중복 확인 (unique 제약 조건 추가에 따른 변경)
    if (createUserDto.email) {
      const existingUserByEmail = await this.userModel.findOne({ email: createUserDto.email }).exec();
      if (existingUserByEmail) {
        // 이미 존재하는 이메일인 경우 ConflictException을 발생시킵니다.
        throw new ConflictException('이미 등록된 이메일입니다.');
      }
    }

    // 비밀번호 해싱
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    // 새로운 사용자 문서 생성
    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword, // 해싱된 비밀번호로 저장
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
   * 사용자 이름(username)으로 사용자를 조회합니다.
   * 인증 모듈에서 로그인 시 사용될 수 있습니다.
   * @param username 사용자 로그인 ID
   * @returns 조회된 사용자 문서 또는 null
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.userModel.findOne({ username }).exec();
  }

  /**
   * 이메일로 사용자를 조회합니다. (이메일이 있는 경우)
   * @param email 사용자 이메일
   * @returns 조회된 사용자 문서 또는 null
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  /**
   * ID로 사용자를 업데이트합니다.
   * @param id MongoDB 문서 ID
   * @param updateUserDto 업데이트할 사용자 데이터
   * @returns 업데이트된 사용자 문서
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // username이 updateUserDto에 포함되어 있다면 중복 확인
    if (updateUserDto.username) {
      const existingUserByUsername = await this.userModel.findOne({ username: updateUserDto.username }).exec();
      if (existingUserByUsername && String(existingUserByUsername._id) !== id) {
        throw new ConflictException('이미 사용 중인 사용자 ID입니다.');
      }
    }

    // email이 updateUserDto에 포함되어 있고, 변경하려는 경우 중복 확인
    if (updateUserDto.email) {
      const existingUserByEmail = await this.userModel.findOne({ email: updateUserDto.email }).exec();
      if (existingUserByEmail && String(existingUserByEmail._id) !== id) {
        throw new ConflictException('이미 등록된 이메일입니다.');
      }
    }

    // 비밀번호가 updateUserDto에 포함되어 있다면 해싱합니다.
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt(10);
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
    if (!updatedUser) {
      throw new NotFoundException(`ID가 ${id}인 사용자를 찾을 수 없습니다.`);
    }
    return updatedUser;
  }

  /**
   * ID로 사용자를 삭제합니다.
   * @param id MongoDB 문서 ID
   * @returns 삭제된 사용자 문서
   */
  async remove(id: string): Promise<User> {
    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
    if (!deletedUser) {
      throw new NotFoundException(`ID가 ${id}인 사용자를 찾을 수 없습니다.`);
    }
    return deletedUser;
  }
}
