/**
 * @file welfare-response-code.enum.d.ts
 * @description 외부 복지 API의 응답(에러) 코드
 */
export enum WelfareResponseCode {
  SUCCESS = '0',
  HTTP_ERROR = '04',
  INVALID_REQUEST_PARAMETER_ERROR = '10',
  NO_OPENAPI_SERVICE_ERROR = '12',
  SERVICE_ACCESS_DENIED_ERROR = '20',
  LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS_ERROR = '22',
  SERVICE_KEY_IS_NOT_REGISTERED_ERROR = '30',
  DEADLINE_HAS_EXPIRED_ERROR = '31',
  UNKNOWN_ERROR = '99',
}
