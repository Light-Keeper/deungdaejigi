// src/users/dto/update-user.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsString, MinLength, MaxLength, IsOptional, IsNumber, Min, Max, IsInt, IsIn } from 'class-validator';

// PartialType은 CreateUserDto의 모든 필드를 선택적으로 만듭니다.
// 즉, 사용자를 업데이트할 때 모든 필드를 제공할 필요가 없습니다.
export class UpdateUserDto extends PartialType(CreateUserDto) {
  // 사용자 로그인 ID 필드입니다. 업데이트 시 선택 사항입니다.
  @IsOptional()
  @IsString({ message: '사용자 ID는 문자열이어야 합니다.' })
  @MinLength(4, { message: '사용자 ID는 최소 4자 이상이어야 합니다.' })
  @MaxLength(20, { message: '사용자 ID는 최대 20자 이하여야 합니다.' })
  username?: string; // 업데이트 시 선택 사항이므로 ?를 추가합니다.

  // 닉네임 필드는 선택적이며, 유효성 검사를 추가로 정의할 수 있습니다.
  @IsOptional()
  @IsString({ message: '닉네임은 문자열이어야 합니다.' })
  @MinLength(2, { message: '닉네임은 최소 2자 이상이어야 합니다.' })
  @MaxLength(10, { message: '닉네임은 최대 10자 이하여야 합니다.' })
  nickname?: string;

  // 비밀번호 필드도 선택적이며, 유효성 검사를 추가로 정의할 수 있습니다.
  @IsOptional()
  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  @MaxLength(20, { message: '비밀번호는 최대 20자 이하여야 합니다.' })
  password?: string;

  // 성별 필드도 선택적이며, 유효성 검사를 추가로 정의할 수 있습니다.
  @IsOptional()
  @IsString({ message: '성별은 문자열이어야 합니다.' })
  @IsIn(['male', 'female', 'other'], { message: '유효한 성별을 선택해주세요 (male, female, other).' })
  gender?: string;

  // 나이 필드도 선택적이며, 유효성 검사를 추가로 정의할 수 있습니다.
  @IsOptional()
  @IsNumber({}, { message: '나이는 숫자여야 합니다.' })
  @IsInt({ message: '나이는 정수여야 합니다.' })
  @Min(0, { message: '나이는 0 이상이어야 합니다.' })
  @Max(150, { message: '나이는 150 이하여야 합니다.' })
  age?: number;
}
