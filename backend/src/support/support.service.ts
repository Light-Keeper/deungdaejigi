// src/support/support.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SupportInfo, SupportInfoDocument } from './schemas/support-info.schema';

@Injectable()
export class SupportService { // 클래스 이름이 SupportService임을 확인하세요 (nest g s support 명령으로 생성됨)
  constructor(
    @InjectModel(SupportInfo.name) private supportInfoModel: Model<SupportInfoDocument>,
  ) {}

  /**
   * 모든 지원 정보를 조회합니다.
   * @returns SupportInfo 문서 배열.
   */
  async findAll(): Promise<SupportInfo[]> {
    return this.supportInfoModel.find().exec();
  }

  /**
   * 유형(긴급 또는 맞춤)에 따라 지원 정보를 조회합니다.
   * @param type 조회할 지원 정보 유형 ('긴급' 또는 '맞춤').
   * @returns 해당 유형의 SupportInfo 문서 배열.
   */
  async findByType(type: string): Promise<SupportInfo[]> {
    return this.supportInfoModel.find({ type }).exec();
  }

  /**
   * 키워드를 사용하여 지원 정보를 검색합니다 (제목 또는 설명에서).
   * @param keyword 검색할 키워드.
   * @returns 검색된 SupportInfo 문서 배열.
   */
  async findByKeyword(keyword: string): Promise<SupportInfo[]> {
    const searchRegex = new RegExp(keyword, 'i'); // 대소문자 구분 없이 검색
    return this.supportInfoModel.find({
      $or: [
        { title: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
      ],
    }).exec();
  }
}