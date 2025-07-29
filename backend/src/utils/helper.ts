import * as crypto from 'crypto';

export class Helper {
  // =========== 헬퍼 함수 ============
  /**
   * 문자열을 delimeter를 기준으로 자르고 각 요소의 앞뒤 공백을 제거해 배열로 반환합니다.
   * @param str - 자를 문자열
   * @param delimeter - 구분자
   * @returns {string[]} 자른 문자열 배열
   */
  static splitStringToArray(str: string, delimeter: string): string[] {
    if (typeof str !== 'string' || str.trim() === '') {
      return [];
    }
    return str
      .split(delimeter)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }
  /**
   * 입력 문자열의 SHA-256 해시를 기반으로 고유한 8자리 숫자 ID를 생성합니다.
   * 접두사를 포함하여 최종 ID를 반환합니다.
   *
   * @param prefix ID에 붙일 접두사 (예: 'PRIVORG_')
   * @param inputString 해시를 생성할 원본 문자열 (예: 서비스명)
   * @returns 접두사와 8자리 숫자가 결합된 문자열 ID (예: 'PRIVORG_12345678')
   */
  static generateShortHashId(prefix: string, inputString: string): string {
    // 1. SHA-256 해시를 16진수 문자열로 생성
    const hash: string = crypto
      .createHash('sha256')
      .update(inputString)
      .digest('hex');

    // 2. 해시 값의 일부(예: 앞 16자리)를 BigInt로 변환하여 충분한 고유성을 확보
    //    64자리 전체를 BigInt로 변환 후 substring 하는 것보다 효율적이고 의도에 부합
    const relevantHashPart = hash.substring(0, 16); // 16진수 16자리는 64비트 정수를 표현하기에 충분
    const bigIntValue = BigInt(`0x${relevantHashPart}`);

    // 3. BigInt 값을 8자리 숫자의 범위 (0 ~ 99,999,999) 안으로 강제 변환
    //    `% 100000000n` 연산을 통해 0부터 99,999,999 사이의 숫자를 얻음
    const eightDigitNumber = (bigIntValue % 100000000n).toString();

    // 4. 8자리로 패딩 (앞에 0 채우기)
    //    예: '12345' -> '00012345'
    const paddedNumber = eightDigitNumber.padStart(8, '0');

    // 5. 접두사와 결합하여 최종 ID 반환
    return `${prefix}${paddedNumber}`;
  }
}
