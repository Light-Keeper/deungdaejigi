import { Controller, Post, Body } from '@nestjs/common';

import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(@Body() createPostDto: CreatePostDto) {
    // 👇 서비스로 임시 닉네임까지 함께 넘겨줌
    return this.postsService.create(createPostDto);
  }
}
