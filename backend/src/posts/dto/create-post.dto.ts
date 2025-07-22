import { IsString } from 'class-validator';

export class CreatePostDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsString()
  category: string;

  // 👇 로그인 기능 구현 전, 임시로 사용할 작성자 닉네임
  @IsString()
  authorNickname: string;
}
