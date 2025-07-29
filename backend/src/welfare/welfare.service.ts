// src/welfare/welfare.service.ts (import 경로 수정)

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Welfare, WelfareDocument } from './schemas/welfare.schema';
import { 
  SearchWelfareOptions, 
  SearchWelfareResult 
} from './dto/welfare.dto'; // 🔧 경로 수정: search-welfare.dto → welfare.dto
import { firstValueFrom, catchError } from 'rxjs';
import { AxiosError } from 'axios';
import * as xml2js from 'xml2js';
import { WelfareProviderType } from './enum/welfare-provider-type.enum';
import { WelfareResponseCode } from './enum/welfare-response-code.enum';
import { Helper } from 'src/utils/helper';

@Injectable()
export class WelfareService {
  private readonly logger = new Logger(WelfareService.name);
  private readonly DECODED_API_KEY: string;
  private readonly DEFAULT_PAGE_SIZE: number;

  // API URLs
  private readonly CENTRAL_MINISTRY_WELFARE_URL =
    'https://apis.data.go.kr/B554287/NationalWelfareInformationsV001/NationalWelfarelistV001';
  private readonly LOCAL_GOVERNMENT_WELFARE_URL =
    'https://apis.data.go.kr/B554287/LocalGovernmentWelfareInformations/LcgvWelfarelist';
  private readonly PRIVATE_ORGANIZATION_WELFARE_API_URL =
    'https://api.odcloud.kr/api/15116392/v1/uddi:e42c15c4-d478-4210-922f-fb32233dc8f6';

  constructor(
    @InjectModel(Welfare.name)
    private welfareModel: Model<WelfareDocument>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.DECODED_API_KEY = this.configService.get<string>('DECODED_PUBLIC_DATA_API_KEY', '');
    this.DEFAULT_PAGE_SIZE = 500;

    if (this.DECODED_API_KEY === '') {
      this.logger.error('DECODED_PUBLIC_DATA_API_KEY 환경 변수가 설정되지 않았습니다.');
      throw new Error('DECODED_PUBLIC_DATA_API_KEY 환경 변수 누락');
    }
  }

  /**
   * 복지 정보 검색 및 필터링
   */
  async searchWelfares(options: SearchWelfareOptions): Promise<SearchWelfareResult> {
    const { keyword, page, limit, sourceType, serviceCategory, targetAudience, lifeCycle, provider, sort } = options;

    // MongoDB 쿼리 조건 생성
    const filter: any = {};

    // 키워드 검색 (복지명, 설명에서 검색)
    if (keyword && keyword.trim() !== '') {
      filter.$or = [
        { serviceName: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { provider: { $regex: keyword, $options: 'i' } },
      ];
    }

    // 필터 조건들
    if (sourceType) filter.sourceType = sourceType;
    if (provider) filter.provider = { $regex: provider, $options: 'i' };
    
    // 배열 필드 필터링
    if (serviceCategory) filter.serviceCategory = { $in: [serviceCategory] };
    if (targetAudience) filter.targetAudience = { $in: [targetAudience] };
    if (lifeCycle) filter.lifeCycle = { $in: [lifeCycle] };

    // 정렬 옵션 설정
    let sortOption: any = { lastUpdated: -1 }; // 기본: 최신순
    switch (sort) {
      case 'name':
        sortOption = { serviceName: 1 }; // 이름순
        break;
      case 'provider':
        sortOption = { provider: 1, serviceName: 1 }; // 제공자순
        break;
      case 'latest':
      default:
        sortOption = { lastUpdated: -1 }; // 최신순
        break;
    }

    // 페이지네이션 계산
    const skip = Math.max(0, (page - 1) * limit);

    try {
      // 병렬 쿼리 실행
      const [welfares, totalCount] = await Promise.all([
        this.welfareModel
          .find(filter)
          .sort(sortOption)
          .skip(skip)
          .limit(limit)
          .select('-__v') // __v 필드 제외
          .exec(),
        this.welfareModel.countDocuments(filter).exec(),
      ]);

      // 페이지 정보 계산
      const totalPages = Math.max(1, Math.ceil(totalCount / limit));
      const currentPage = Math.min(page, totalPages);
      const hasNextPage = currentPage < totalPages;
      const hasPrevPage = currentPage > 1;

      return {
        welfares,
        totalCount,
        totalPages,
        currentPage,
        hasNextPage,
        hasPrevPage,
      };
    } catch (error) {
      this.logger.error(`복지 정보 검색 중 오류 발생: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 특정 복지 정보 상세 조회
   */
  async findOne(id: string): Promise<Welfare> {
    try {
      const welfare = await this.welfareModel.findById(id).select('-__v').exec();
      
      if (!welfare) {
        throw new NotFoundException(`ID가 ${id}인 복지 정보를 찾을 수 없습니다.`);
      }

      return welfare;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`복지 정보 조회 중 오류 발생: ${error.message}`, error.stack);
      throw new NotFoundException(`복지 정보 조회 중 오류가 발생했습니다.`);
    }
  }

  /**
   * 필터 옵션들 조회 (드롭다운용)
   */
  async getFilterOptions() {
    try {
      const [sourceTypes, serviceCategories, targetAudiences, lifeCycles, providers] = await Promise.all([
        // 제공기관 목록
        this.welfareModel.distinct('sourceType').exec(),
        
        // 서비스 분야 목록 (배열 필드 flatten)
        this.welfareModel.aggregate([
          { $unwind: '$serviceCategory' },
          { $group: { _id: '$serviceCategory', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]).exec(),
        
        // 지원 대상 목록
        this.welfareModel.aggregate([
          { $unwind: '$targetAudience' },
          { $group: { _id: '$targetAudience', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]).exec(),
        
        // 생애 주기 목록
        this.welfareModel.aggregate([
          { $unwind: '$lifeCycle' },
          { $group: { _id: '$lifeCycle', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]).exec(),
        
        // 제공자 목록
        this.welfareModel.aggregate([
          { $group: { _id: '$provider', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 50 }, // 상위 50개만
        ]).exec(),
      ]);

      return {
        sourceTypes: sourceTypes.filter(type => type), // null/undefined 제거
        serviceCategories: serviceCategories.map(item => ({
          name: item._id,
          count: item.count,
        })).filter(item => item.name), // null/undefined 제거
        targetAudiences: targetAudiences.map(item => ({
          name: item._id,
          count: item.count,
        })).filter(item => item.name),
        lifeCycles: lifeCycles.map(item => ({
          name: item._id,
          count: item.count,
        })).filter(item => item.name),
        providers: providers.map(item => ({
          name: item._id,
          count: item.count,
        })).filter(item => item.name),
      };
    } catch (error) {
      this.logger.error(`필터 옵션 조회 중 오류 발생: ${error.message}`, error.stack);
      throw error;
    }
  }

  // === 기존 동기화 관련 메서드들 (그대로 유지) ===
  
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async handleCron() {
    this.logger.log('매월 1일 복지 정보 데이터 동기화를 시작합니다...');
    try {
      await this.syncAllWelfareData();
      console.log('복지 정보 데이터 동기화가 완료되었습니다.');
    } catch (error) {
      console.error('복지 정보 동기화 중 에러 발생:', error);
    }
  }

  private async callExternalApiAndParse(
    url: string,
    params: Record<string, any>,
  ): Promise<{ rawData: any[]; totalCount: number }> {
    try {
      const loggableParams = { ...params };
      if (loggableParams.serviceKey) {
        loggableParams.serviceKey = '**********************';
      }

      this.logger.debug(
        `API 호출: ${url} \nparams: ${JSON.stringify(loggableParams, null, 4)}`,
      );

      // API 요청
      const response = await firstValueFrom(
        this.httpService
          .get(url, { params, responseType: 'text' })
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(`API 호출 실패: ${error.message} for ${url}`);
              this.logger.error(
                `Error details: ${error.response?.data || error.message}`,
              );
              throw new Error(`External API call failed: ${error.message}`);
            }),
          ),
      );

      let apiData: any[] = [];
      let totalCount: number = 0;

      switch (params.type) {
        case WelfareProviderType.CENTRAL_MINISTRY:
          const xmlString = response.data;
          const parser = new xml2js.Parser({
            explicitArray: false,
            mergeAttrs: true,
          });

          const result = await parser.parseStringPromise(xmlString);
          const wantedList = result.wantedList;
          if (!wantedList) {
            throw new Error('Invalid XML response structure: Missing Root tag');
          }

          apiData = wantedList.servList || [];
          totalCount = parseInt(wantedList.totalCount || '0', 10);

          if (!Array.isArray(apiData)) {
            apiData = [apiData];
          }

          this.logger.debug(
            `Parsed XML: totalCount=${totalCount}, itemsCount=${apiData.length}`,
          );

          if (wantedList.resultCode !== WelfareResponseCode.SUCCESS) {
            this.logger.error(
              `API 에러 발생: Code=${wantedList.resultCode}, Message=${wantedList.resultMessage}`,
            );
          }
          break;

        case WelfareProviderType.LOCAL_GOV:
          break;

        case WelfareProviderType.PRIVATE_ORG:
          break;

        default:
          throw new Error(
            `Unsupported API type for parsing. Please define its parsing logic.`,
          );
      }

      return { rawData: apiData, totalCount: totalCount };
    } catch (error) {
      this.logger.error(
        `Error in callExternalApiAndParse for ${url}: ${error.message}`,
      );
      throw error;
    }
  }

  private async fetchAllWelfareRawData(
    apiEndpoint: string,
    initialParams: Record<string, any>,
    pageSize: number = this.DEFAULT_PAGE_SIZE,
  ): Promise<any[]> {
    this.logger.log(`${apiEndpoint}의 데이터를 가져옵니다.`);
    let allCollectedRawData: any[] = [];
    let currentPage = 1;
    let totalCount = 0;
    let fetchedCount = 0;

    do {
      try {
        const params = {
          ...initialParams,
          pageNo: currentPage,
          page: currentPage,
          numOfRows: pageSize,
          perPage: pageSize,
        };

        const { rawData: currentBatchRawData, totalCount: currentTotalCount } =
          await this.callExternalApiAndParse(apiEndpoint, params);

        if (currentPage === 1) {
          totalCount = currentTotalCount;
          if (totalCount === 0) {
            this.logger.log(
              `[${apiEndpoint}] 총 데이터가 0개입니다. 동기화를 종료합니다.`,
            );
            break;
          }
          this.logger.log(
            `[${apiEndpoint}] 총 ${totalCount}개의 데이터가 확인되었습니다.`,
          );
        }

        if (!currentBatchRawData || currentBatchRawData.length === 0) {
          this.logger.warn(
            `[${apiEndpoint}] 페이지 ${currentPage}에 데이터가 없거나 더 이상 데이터가 없습니다. 반복을 종료합니다.`,
          );
          break;
        }

        allCollectedRawData = allCollectedRawData.concat(currentBatchRawData);
        fetchedCount += currentBatchRawData.length;

        this.logger.log(
          `[${apiEndpoint}] 페이지 ${currentPage}에서 ${currentBatchRawData.length}개 수집. 현재까지 ${fetchedCount}개 / ${totalCount}개`,
        );

        currentPage++;
      } catch (error) {
        this.logger.error(
          `[${apiEndpoint}] 데이터 수집 중 치명적인 오류 (페이지 ${currentPage}): ${error.message}.`,
        );
        throw error;
      }
    } while (fetchedCount < totalCount);

    this.logger.log(
      `${apiEndpoint}에서 데이터 가져오기가 완료됐습니다. 총 가져온 데이터 수: ${allCollectedRawData.length}개`,
    );
    return allCollectedRawData;
  }

  private transformRawDataToWelfare(
    rawData: any,
    apiDataSourceType: string,
  ): Welfare {
    let transformedItem: Partial<Welfare> = {};

    switch (apiDataSourceType) {
      case WelfareProviderType.CENTRAL_MINISTRY:
        transformedItem = {
          sourceType: '중앙부처',
          serviceName: rawData.servNm || undefined,
          serviceId: rawData.servId || undefined,
          description: rawData.servDgst || undefined,
          provider: rawData.jurMnofNm + ' ' + rawData.jurOrgNm || undefined,
          contact: rawData.rprsCtadr || undefined,
          serviceURL: rawData.servDtlLink || undefined,
          serviceCategory:
            Helper.splitStringToArray(rawData.intrsThemaArray, ',') ||
            undefined,
          lastUpdated: rawData.svcfrstRegTs || undefined,
        };
        break;
      case WelfareProviderType.LOCAL_GOV:
        break;
      case WelfareProviderType.PRIVATE_ORG:
        break;
      default:
        this.logger.warn(
          `알 수 없는 API 출처: ${apiDataSourceType}. 데이터 변환을 건넙니다.`,
        );
        throw new Error(
          `Unknown API source type for transformation: ${apiDataSourceType}`,
        );
    }

    if (!transformedItem.serviceId) {
      transformedItem.serviceId = `GENERATED_${apiDataSourceType}_${Date.now()}_${Math.random()}`;
    }
    return transformedItem as Welfare;
  }

  async saveWelfareData(welfareData: Welfare[]): Promise<void> {
    if (!welfareData || welfareData.length === 0) {
      this.logger.log(
        '저장할 복지 정보 데이터가 없습니다. 작업을 건너뜁니다.',
      );
      return;
    }

    this.logger.log(
      `데이터베이스에 ${welfareData.length}개의 복지 정보를 저장(업데이트/삽입)합니다.`,
    );

    const bulkOps = welfareData.map((item) => ({
      updateOne: {
        filter: { serviceId: item.serviceId },
        update: { $set: item },
        upsert: true,
      },
    }));

    try {
      const result = await this.welfareModel.bulkWrite(bulkOps);

      this.logger.log(`데이터베이스 일괄 쓰기(bulkWrite) 완료:
        - 삽입된 문서: ${result.insertedCount}개
        - 수정된 문서: ${result.modifiedCount}개
        - 삽입된(업서트된) 문서: ${result.upsertedCount}개
        - 삭제된 문서: ${result.deletedCount}개
        - 총 처리된 요청: ${bulkOps.length}개`);

      if (result.hasWriteErrors()) {
        this.logger.error(
          `bulkWrite 중 일부 오류 발생: ${JSON.stringify(result.getWriteErrors())}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `복지 정보 데이터를 DB에 저장하는 중 에러 발생: ${error.message}`,
        error.stack,
      );
      throw new Error(`DB 저장 실패: ${error.message}`);
    }
  }

  async syncAllWelfareData(): Promise<void> {
    this.logger.log('===== 복지 데이터 동기화 시작 =====');

    const apiConfigs = [
      {
        type: WelfareProviderType.CENTRAL_MINISTRY,
        endpoint: this.CENTRAL_MINISTRY_WELFARE_URL,
        params: {
          serviceKey: this.configService.get<string>(
            'DECODED_PUBLIC_DATA_API_KEY',
          ),
          callTp: 'L',
          srchKeyCode: '003',
        },
      },
    ];

    for (const config of apiConfigs) {
      try {
        this.logger.log(`--- 동기화 대상: [${config.type}] API ---`);

        const rawData = await this.fetchAllWelfareRawData(config.endpoint, {
          ...config.params,
          type: config.type,
        });
        this.logger.log(
          `[${config.type}] 총 ${rawData.length}개의 원본 데이터 수집 완료.`,
        );

        const transformedData = rawData.map((item) =>
          this.transformRawDataToWelfare(item, config.type),
        );
        this.logger.log(
          `[${config.type}] 총 ${transformedData.length}개의 데이터 변환 완료.`,
        );

        await this.saveWelfareData(transformedData);
        this.logger.log(`[${config.type}] 데이터베이스 저장 완료.`);
      } catch (error) {
        this.logger.error(
          `[${config.type}] 데이터 동기화 실패: ${error.message}`,
          error.stack,
        );
      }
    }

    this.logger.log('===== 복지 데이터 동기화 종료 =====');
  }
}