// src/comments/comments.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { Comment, CommentSchema } from './schemas/comments.schema';
import { Post, PostSchema } from '../posts/schemas/post.schema';

// 댓글 기능 관련 모듈
@Module({
  imports: [
    // Comment 및 Post 스키마를 MongooseModule에 등록
    MongooseModule.forFeature([
      { name: Comment.name, schema: CommentSchema },
      { name: Post.name, schema: PostSchema }, 
    ]),
  ],
  // CommentsService를 이 모듈의 서비스로 등록
  providers: [CommentsService],
  // CommentsController를 이 모듈의 컨트롤러로 등록
  controllers: [CommentsController],
})
export class CommentsModule {}
