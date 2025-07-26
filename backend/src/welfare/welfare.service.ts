import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  WelfareService as WelfareServiceModel,
  WelfareServiceDocument,
} from './schemas/welfare.schema';

@Injectable()
export class WelfareService {
  constructor(
    @InjectModel(WelfareServiceModel.name)
    private welfareModel: Model<WelfareServiceDocument>,
  ) {}

  /**
   * 현재 신청 가능한 모든 복지 정보를 조회합니다.
   */
  // 💡 [수정] 반환 타입도 별칭을 사용하여 명확하게 합니다.
  async findAvailable(): Promise<WelfareServiceModel[]> {
    const today = new Date();
    return this.welfareModel
      .find({
        // 신청 마감일이 없거나, 오늘보다 크거나 같은 경우만 조회
        $or: [
          { applicationEndDate: { $exists: false } },
          { applicationEndDate: { $gte: today } },
        ],
      })
      .exec();
  }

  /**
   * 특정 복지 정보의 상세 내용을 조회합니다.
   */
  async findOne(id: string): Promise<WelfareServiceModel> {
    const service = await this.welfareModel.findById(id).exec();
    if (!service) {
      throw new NotFoundException(
        `ID가 ${id}인 복지 서비스를 찾을 수 없습니다.`,
      );
    }
    return service;
  }

  /**
   * (데이터 관리 시스템용) 만료된 복지 정보를 DB에서 삭제합니다.
   * 이 함수는 Cron Job 등으로 주기적으로 호출되어야 합니다.
   */
  async cleanupExpiredServices(): Promise<{ deletedCount: number }> {
    const today = new Date();
    const result = await this.welfareModel
      .deleteMany({
        applicationEndDate: { $exists: true, $lt: today },
      })
      .exec();
    return { deletedCount: result.deletedCount };
  }

  // (데이터 관리 시스템용) 복지 정보 생성 및 수정 함수는 여기에 추가...
  // async create(createDto: CreateWelfareDto) { ... }
  // async update(id: string, updateDto: UpdateWelfareDto) { ... }
}
