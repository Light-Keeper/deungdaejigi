import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    example: '오늘의 돌봄 일기',
    description: '게시글 제목',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: '오늘은 이런저런 일이 있었습니다...',
    description: '게시글 본문',
  })
  @IsString()
  content: string;

  @ApiProperty({
    example: ['#일기', '#힘듦'],
    description: '해시태그 배열',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hashtags: string[];
}
