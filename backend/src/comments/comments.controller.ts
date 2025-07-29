// src/comments/comments.controller.ts

import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { Comment, CommentDocument } from './schemas/comments.schema'; 
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

// 댓글 API 엔드포인트 정의
// 기본 경로: /posts/:postId/comments
@Controller('posts/:postId/comments')
export class CommentsController { 
  constructor(private readonly commentsService: CommentsService) {}

  // 댓글 생성: POST /posts/:postId/comments
  @Post()
  @HttpCode(HttpStatus.CREATED) // 201 Created
  async create(
    @Param('postId') postId: string, // URL에서 게시글 ID 추출
    @Body() createCommentDto: CreateCommentDto, // 요청 본문에서 댓글 데이터 추출
  ) {
    return this.commentsService.create(postId, createCommentDto);
  }

  // 특정 게시글의 모든 댓글 조회: GET /posts/:postId/comments
  @Get()
  async findAll(@Param('postId') postId: string) { // URL에서 게시글 ID 추출
    return this.commentsService.findAllByPostId(postId);
  }

  // 댓글 수정: PATCH /posts/:postId/comments/:commentId
  @Patch(':commentId')
  async update(
    @Param('commentId') commentId: string, // URL에서 댓글 ID 추출
    @Body() updateCommentDto: UpdateCommentDto, // 요청 본문에서 수정 데이터 추출
  ) {
    return this.commentsService.update(commentId, updateCommentDto);
  }

  // 댓글 삭제: DELETE /posts/:postId/comments/:commentId
  @Delete(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content
  async remove(@Param('commentId') commentId: string) { // URL에서 댓글 ID 추출
    await this.commentsService.remove(commentId);
  }
}
