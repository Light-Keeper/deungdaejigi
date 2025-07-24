// src/users/dto/create-user.dto.ts
import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsNotEmpty, IsNumber, Min, Max, IsInt, IsIn } from 'class-validator';

// CreateUserDto는 새로운 사용자를 생성할 때 필요한 데이터 유효성 검사를 정의합니다.
export class CreateUserDto {
  // 사용자 로그인 ID 필드입니다. 필수로 고유해야 합니다.
  @IsNotEmpty({ message: '사용자 ID를 입력해주세요.' })
  @IsString({ message: '사용자 ID는 문자열이어야 합니다.' })
  @MinLength(4, { message: '사용자 ID는 최소 4자 이상이어야 합니다.' })
  @MaxLength(20, { message: '사용자 ID는 최대 20자 이하여야 합니다.' })
  username: string;

  // 이메일 필드입니다. 이제 선택 사항입니다.
  @IsOptional()
  @IsEmail({}, { message: '유효한 이메일 주소를 입력해주세요.' })
  email?: string;

  // 비밀번호 필드입니다. required: true로 설정되어 있습니다.
  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  @MaxLength(20, { message: '비밀번호는 최대 20자 이하여야 합니다.' })
  password: string;

  // 닉네임 필드입니다. required: true로 설정되어 있습니다.
  @IsString({ message: '닉네임은 문자열이어야 합니다.' })
  @MinLength(2, { message: '닉네임은 최소 2자 이상이어야 합니다.' })
  @MaxLength(10, { message: '닉네임은 최대 10자 이하여야 합니다.' })
  nickname: string;

  // 성별 필드입니다. 필수이며 특정 값 중 하나여야 합니다.
  @IsNotEmpty({ message: '성별을 입력해주세요.' })
  @IsString({ message: '성별은 문자열이어야 합니다.' })
  @IsIn(['male', 'female', 'other'], { message: '유효한 성별을 선택해주세요 (male, female, other).' })
  gender: string;

  // 나이 필드입니다. 필수이며 숫자여야 합니다.
  @IsNotEmpty({ message: '나이를 입력해주세요.' })
  @IsNumber({}, { message: '나이는 숫자여야 합니다.' })
  @IsInt({ message: '나이는 정수여야 합니다.' })
  @Min(0, { message: '나이는 0 이상이어야 합니다.' })
  @Max(150, { message: '나이는 150 이하여야 합니다.' })
  age: number;
}
