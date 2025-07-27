import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Welfare, WelfareDocument } from './schemas/welfare.schema';
// 💡 Observable을 Promise로 변환하기 위해 firstValueFrom을 가져옵니다.
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WelfareService {
  private readonly logger = new Logger(WelfareService.name);
  private readonly ENCODED_API_KEY: string;
  private readonly DECODED_API_KEY: string;

  constructor(
    @InjectModel(Welfare.name)
    private welfareModel: Model<WelfareDocument>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.ENCODED_API_KEY = this.configService.get<string>(
      'ENCODED_PUBLIC_DATA_API_KEY',
      '',
    );
    this.DECODED_API_KEY = this.configService.get<string>(
      'DECODED_PUBLIC_DATA_API_KEY',
      '',
    );

    // 환경 변수가 제대로 로드되었는지 확인 (개발 단계에서 유용)
    if (this.ENCODED_API_KEY === '') {
      this.logger.error(
        'ENCODED_PUBLIC_DATA_API_KEY 환경 변수가 설정되지 않았습니다.',
      );
      throw new Error('ENCODED_PUBLIC_DATA_API_KEY 환경 변수 누락');
    }
    if (this.DECODED_API_KEY === '') {
      this.logger.error(
        'DECODED_PUBLIC_DATA_API_KEY 환경 변수가 설정되지 않았습니다.',
      );
      throw new Error('DECODED_PUBLIC_DATA_API_KEY 환경 변수 누락');
    }
  }

  // 매월 1일 자정에 실행되는 크론 작업
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async handleCron() {
    this.logger.debug('매월 1일 복지 정보 데이터 동기화를 시작합니다...');

    try {
      // 공공데이터포털에서 복지 정보 데이터를 가져옵니다.

      console.log('복지 정보 데이터 동기화가 완료되었습니다.');
    } catch (error) {
      console.error('복지 정보 동기화 중 에러 발생:', error);
    }
  }

  async fetchWelfareData(): Promise<any[]> {
    this.logger.debug(
      '한국사회복지정보원에서 복지 정보 데이터를 가져옵니다...',
    );
    try {
      const url =
        'https://api.odcloud.kr/api/15083323/v1/uddi:48d6c839-ce02-4546-901e-e9ad9bae8e0d';

      const { data } = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            perPage: 1000, // 페이지당 최대 1000개 데이터 요청
          },
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Infuser ${this.DECODED_API_KEY}`,
          },
        }),
      );
      return [];
    } catch (error) {
      this.logger.error('복지 정보 데이터를 가져오는 중 에러 발생:', error);
      throw error;
    }
  }

  async saveWelfareData(data: any) {
    this.logger.debug('복지 정보 데이터를 데이터베이스에 저장합니다...');
    try {
      const createdWelfare = new this.welfareModel(data);
      await createdWelfare.save();
      this.logger.debug('복지 정보 데이터가 성공적으로 저장되었습니다.');
    } catch (error) {
      this.logger.error('복지 정보 데이터를 저장하는 중 에러 발생:', error);
      throw error;
    }
  }

  // ... (cleanupExpiredServices 함수)
}
