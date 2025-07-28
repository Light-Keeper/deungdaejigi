import { IsOptional, IsString, IsIn } from 'class-validator';

export class GetSupportInfoQueryDto {
  // type 쿼리 파라미터는 선택 사항이며, '긴급' 또는 '맞춤' 중 하나여야 합니다.
  @IsOptional()
  @IsString()
  @IsIn(['긴급', '맞춤'])
  type?: string;

  // keyword 쿼리 파라미터는 선택 사항이며, 문자열이어야 합니다.
  @IsOptional()
  @IsString()
  keyword?: string;
}