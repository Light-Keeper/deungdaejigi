import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel, raw } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Welfare, WelfareDocument } from './schemas/welfare.schema';
import { firstValueFrom, catchError } from 'rxjs';
import { all, AxiosError } from 'axios';
import * as xml2js from 'xml2js';
import { WelfareProviderType } from './enum/welfare-provider-type.enum';
import { WelfareResponseCode } from './enum/welfare-response-code.enum';
import { Helper } from 'src/utils/helper';

@Injectable()
export class WelfareService {
  private readonly logger = new Logger(WelfareService.name);
  private readonly ENCODED_API_KEY: string;
  private readonly DECODED_API_KEY: string;
  private readonly DEFAULT_PAGE_SIZE: number;

  // 중앙부처 복지서비스 정보 API
  private readonly CENTRAL_MINISTRY_WELFARE_URL =
    'https://apis.data.go.kr/B554287/NationalWelfareInformationsV001/NationalWelfarelistV001';
  // 지자체 복지서비스 정보 API
  private readonly LOCAL_GOVERNMENT_WELFARE_URL =
    'https://apis.data.go.kr/B554287/LocalGovernmentWelfareInformations/LcgvWelfarelist';
  // 민간기관 복지서비스 정보 API
  private readonly PRIVATE_ORGANIZATION_WELFARE_API_URL =
    'https://api.odcloud.kr/api/15116392/v1/uddi:e42c15c4-d478-4210-922f-fb32233dc8f6';

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
    this.DEFAULT_PAGE_SIZE = 500;

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

  // 1. 외부 복지 정보 API를 불러오고 파싱한다.
  /**
   * 이 함수는 각 API를 JSON으로 파싱하고 { rawData: any[], totalCount: number } 형태를 반환합니다.
   * @param url 접근할 API URL
   * @param params 요청 시 사용할 파라미터
   * @returns
   */
  private async callExternalApiAndParse(
    url: string,
    params: Record<string, any>,
  ): Promise<{ rawData: any[]; totalCount: number }> {
    try {
      this.logger.debug(
        `API 호출: ${url} \nparams: ${JSON.stringify(params, null, 4)}`,
      );

      // API 요청
      const response = await firstValueFrom(
        this.httpService
          .get(url, { params, responseType: 'text' }) // 응답 타입을 문자열로
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(`API 호출 실패: ${error.message} for ${url}`);
              // 실제 API 오류 응답이 XML일 수도 있으니, error.response.data도 파싱 고려
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
        // 중앙부처
        case WelfareProviderType.CENTRAL_MINISTRY:
          const xmlString = response.data; // API 호출 결과

          // xml2json 파서
          const parser = new xml2js.Parser({
            explicitArray: false, // 단일 태그가 배열이 아닌 단일 객체나 문자열로 파싱되도록 설정
            mergeAttrs: true, // XML 속성(attributes)을 일반 요소와 병합
          });

          // 파싱한 결과
          const result = await parser.parseStringPromise(xmlString);

          const wantedList = result.wantedList; // root 태그
          if (!wantedList) {
            throw new Error('Invalid XML response structure: Missing Root tag');
          }

          apiData = wantedList.servList || []; // <servList> 데이터 배열, 없으면 빈 배열
          totalCount = parseInt(wantedList.totalCount || '0', 10); // 총 데이터 개수

          // <servList>가 하나만 있을 경우 xml2js는 배열이 아닌 단일 객체로 파싱할 수 있으므로 배열로 강제 변환
          if (!Array.isArray(apiData)) {
            apiData = [apiData];
          }

          // 전체 데이터 개수, 불러온 데이터 개수
          this.logger.debug(
            `Parsed XML: totalCount=${totalCount}, itemsCount=${apiData.length}`,
          );

          // API 결과 코드 및 메시지 확인 (필요시)
          if (wantedList.resultCode !== WelfareResponseCode.SUCCESS) {
            this.logger.error(
              `API 에러 발생: Code=${wantedList.resultCode}, Message=${wantedList.resultMessage}`,
            );
            // throw new Error(`API error: ${wantedList.resultMessage}`); // 필요하다면 오류 throw
          }

          break;

        // 지자체
        case WelfareProviderType.LOCAL_GOV:
          break;

        // 민간단체
        case WelfareProviderType.PRIVATE_ORG:
          break;

        default:
          throw new Error(
            `Unsupported API type for parsing. Please define its parsing logic.`,
          );
      }

      // API 호출 결과 반환
      return { rawData: apiData, totalCount: totalCount };
    } catch (error) {
      this.logger.error(
        `Error in callExternalApiAndParse for ${url}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * 특정 외부 API에서 모든 복지 데이터를 페이지네이션을 통해 가져옵니다.
   * `fetchedCount`가 `totalCount`에 도달할 때까지 반복하여 모든 데이터를 수집합니다.
   *
   * @param apiEndpoint - 외부 API 엔드포인트 URL
   * @param initialParams - API 호출 시 필요한 초기 고정 파라미터 (예: API 키, type: ApiType)
   * @param pageSize - 한 페이지에 불러올 데이터 개수 (기본 500)
   * @returns {Promise<any[]>} 모든 복지 서비스 원본 데이터를 담은 배열 (JSON 객체 형태)
   */
  private async fetchAllWelfareRawData(
    apiEndpoint: string,
    initialParams: Record<string, any>,
    pageSize: number = this.DEFAULT_PAGE_SIZE,
  ): Promise<any[]> {
    this.logger.log(`${apiEndpoint}의 데이터를 가져옵니다.`);
    let allCollectedRawData: any[] = []; // 가져온 전체 원본 데이터 배열
    let currentPage = 1; // 현재 페이지
    let totalCount = 0; // 전체 데이터 개수
    let fetchedCount = 0; // 가져온 원본 데이터 개수

    do {
      try {
        const params = {
          ...initialParams, // API 키, 고정 파라미터
          pageNo: currentPage, // API 별 파라미터 이름 차이 대응
          page: currentPage,
          numOfRows: pageSize,
          perPage: pageSize,
        };

        // rawData와 totalCount를 각각 currentBatchRawData와 currentTotalCount에 할당한다.
        const { rawData: currentBatchRawData, totalCount: currentTotalCount } =
          await this.callExternalApiAndParse(apiEndpoint, params);

        if (currentPage === 1) {
          totalCount = currentTotalCount;
          if (totalCount === 0) {
            this.logger.log(
              `[${apiEndpoint}] 총 데이터가 0개입니다. 동기화를 종료합니다. `,
            );
            break;
          }
          this.logger.log(
            `[${apiEndpoint}] 총 ${totalCount}개의 데이터가 확인되었습니다. `,
          );
        }

        // 현재 페이지에 데이터가 없거나 더이상 없는 경우
        if (!currentBatchRawData || currentBatchRawData.length === 0) {
          this.logger.warn(
            `[${apiEndpoint}] 페이지 ${currentPage}에 데이터가 없거나 더 이상 데이터가 없습니다. 반복을 종료합니다.`,
          );
          break;
        }

        allCollectedRawData = allCollectedRawData.concat(currentBatchRawData); // 원본 데이터 추가
        fetchedCount += currentBatchRawData.length; // 수집된 데이터 개수 업데이트

        this.logger.log(
          `[${apiEndpoint}] 페이지 ${currentPage}에서 ${currentBatchRawData.length}개 수집. 현재까지 ${fetchedCount}개 / ${totalCount}개`,
        );

        currentPage++;
      } catch (error) {
        this.logger.error(
          `[${apiEndpoint}] 데이터 수집 중 치명적인 오류 (페이지 ${currentPage}): ${error.message}.`,
        );
        throw error; // 오류 발생 시 전체 프로세스 중단
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
          // classificationStatus: 'needs_review',
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

  /**
   * 변환된 복지 데이터 배열을 MongoDB에 저장하거나 업데이트합니다.
   * `serviceId`를 기준으로 기존 문서를 업데이트하고, 없으면 새로 삽입(upsert)합니다.
   *
   * @param welfareData - 저장할 Welfare 스키마 형태의 데이터 배열
   * @returns {Promise<void>} 저장 작업 완료 시 반환
   */
  async saveWelfareData(welfareData: Welfare[]): Promise<void> {
    if (!welfareData || welfareData.length === 0) {
      this.logger.log(
        '저장할 복지 정보 데이터가 없습니다. 작업을 건너_ㅂ니다.',
      );
      return;
    }

    this.logger.log(
      `데이터베이스에 ${welfareData.length}개의 복지 정보를 저장(업데이트/삽입)합니다.`,
    );

    // bulkWrite 작업을 위한 요청 배열 생성
    const bulkOps = welfareData.map((item) => ({
      updateOne: {
        filter: { serviceId: item.serviceId }, // `serviceId` 필드를 기준으로 문서를 찾습니다.
        update: { $set: item }, // 찾은 문서를 `item`의 전체 내용으로 업데이트합니다.
        upsert: true, // `filter` 조건에 맞는 문서가 없으면, `item` 데이터를 새 문서로 삽입합니다.
      },
    }));

    try {
      // bulkWrite를 실행하여 여러 쓰기 작업을 한 번에 처리합니다.
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

  /**
   * 모든 외부 복지 API에서 데이터를 가져와 DB에 동기화하는 메인 함수입니다.
   *
   * @description
   * 1. 각 API 설정에 따라 데이터를 가져옵니다 (XML -> JSON 파싱 포함).
   * 2. 가져온 원본 데이터를 내부 Welfare 스키마에 맞게 재구조화하고 변환합니다.
   * 3. 변환된 데이터를 MongoDB에 upsert(업데이트 또는 삽입) 방식으로 저장합니다.
   * 각 API별로 오류 발생 시 전체 동기화가 중단되지 않고 다음 API로 넘어갈 수 있도록 처리합니다.
   */
  async syncAllWelfareData(): Promise<void> {
    this.logger.log('===== 복지 데이터 동기화 시작 =====');

    // 동기화할 각 외부 API의 설정 정보를 배열로 정의합니다.
    const apiConfigs = [
      {
        type: WelfareProviderType.CENTRAL_MINISTRY, // 열거형으로 정의된 API 유형
        endpoint: this.CENTRAL_MINISTRY_WELFARE_URL, // 중앙부처 복지 API 실제 URL
        params: {
          serviceKey: this.configService.get<string>(
            'DECODED_PUBLIC_DATA_API_KEY',
          ),
          callTp: 'L',
          srchKeyCode: '003',
        }, // API별 요청 파라미터
      },
      // {
      //   type: WelfareProviderType.PRIVATE_ORG,
      //   endpoint: 'https://www.data.go.kr/data/15042631/openapi.do', // 민간단체 복지 API 실제 URL (복지로 공통 API일 경우)
      //   params: { serviceKey: 'YOUR_PRIVATE_API_KEY_HERE', callTp: 'L', srchKeyCode: '001' }, // 민간단체 고유 파라미터
      // },
      // {
      //   type: WelfareProviderType.LOCAL_GOV,
      //   endpoint: 'https://www.data.go.kr/data/15042631/openapi.do', // 지자체 복지 API 실제 URL (복지로 공통 API일 경우)
      //   // 지자체 API는 파라미터가 다를 수 있으므로, 실제 API 명세에 맞춰 조정
      //   params: { serviceKey: 'YOUR_LOCAL_API_KEY_HERE', callTp: 'L', srchKeyCode: '002', areaCode: '11000' },
      // }
    ];

    // 각 API 설정에 따라 동기화 프로세스를 순차적으로 실행합니다.
    for (const config of apiConfigs) {
      try {
        this.logger.log(`--- 동기화 대상: [${config.type}] API ---`);

        // 1. **데이터 가져오기 (Raw JSON):**
        //    해당 API의 모든 페이지에 걸친 원본 데이터를 가져옵니다.
        //    params에 ApiType을 추가하여 callExternalApiAndParse에서 파싱 로직을 분기하도록 합니다.
        const rawData = await this.fetchAllWelfareRawData(config.endpoint, {
          ...config.params,
          type: config.type,
        });
        this.logger.log(
          `[${config.type}] 총 ${rawData.length}개의 원본 데이터 수집 완료.`,
        );

        // 2. **데이터 재구조화 (Welfare 스키마로 변환):**
        //    가져온 원본 데이터를 내부 Welfare 스키마에 맞게 변환하고,
        //    serviceCategory 분류 및 기타 데이터 정규화 작업을 수행합니다.
        const transformedData = rawData.map((item) =>
          this.transformRawDataToWelfare(item, config.type),
        );
        this.logger.log(
          `[${config.type}] 총 ${transformedData.length}개의 데이터 변환 완료.`,
        );

        // 3. **데이터 저장 (DB에 Upsert):**
        //    변환된 데이터를 MongoDB에 upsert(업데이트 또는 삽입) 방식으로 저장합니다.
        //    이 단계에서 bulkWrite를 사용하여 효율성을 높입니다.
        await this.saveWelfareData(transformedData);
        this.logger.log(`[${config.type}] 데이터베이스 저장 완료.`);
      } catch (error) {
        // 특정 API 동기화 중 오류가 발생하더라도 전체 프로세스가 중단되지 않도록
        // 여기에서 에러를 catch하고 로깅한 후 다음 API로 넘어갑니다.
        this.logger.error(
          `[${config.type}] 데이터 동기화 실패: ${error.message}`,
          error.stack,
        );
      }
    }

    this.logger.log('===== 복지 데이터 동기화 종료 =====');
  }
}
