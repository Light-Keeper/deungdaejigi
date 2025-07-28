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
}
