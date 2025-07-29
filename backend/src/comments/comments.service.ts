// src/comments/comments.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comments.schema'; 
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Post, PostDocument } from '../posts/schemas/post.schema';

// 댓글 관련 비즈니스 로직을 처리하는 서비스
@Injectable()
export class CommentsService {
  constructor(
    // Comment 모델과 Post 모델 주입
    @InjectModel(Comment.name) private readonly commentModel: Model<CommentDocument>,
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
  ) {}

  // 댓글 생성
  async create(postId: string, createCommentDto: CreateCommentDto): Promise<Comment> {
    // 게시글 존재 여부 확인
    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new NotFoundException(`ID "${postId}"를 가진 게시글을 찾을 수 없습니다.`);
    }

    // 새 댓글 문서 생성 및 저장
    const createdComment = new this.commentModel({
      ...createCommentDto,
      postId: new Types.ObjectId(postId),
    });
    return createdComment.save();
  }

  // 특정 게시글의 모든 댓글 조회 (익명 처리 포함)
  async findAllByPostId(postId: string): Promise<any[]> {
    // 게시글 존재 여부 확인
    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new NotFoundException(`ID "${postId}"를 가진 게시글을 찾을 수 없습니다.`);
    }

    // 해당 게시글의 댓글 조회
    const comments = await this.commentModel.find({ postId: new Types.ObjectId(postId) }).exec();

    // 익명 여부에 따라 닉네임 가공하여 반환
    return comments.map((comment: CommentDocument) => ({
      _id: comment._id,
      postId: comment.postId,
      content: comment.content,
      authorNickname: comment.isAnonymous ? '익명' : comment.authorNickname,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    }));
  }

  // 댓글 수정
  async update(id: string, updateCommentDto: UpdateCommentDto): Promise<Comment> {
    // 댓글을 찾아 업데이트하고, 업데이트된 문서 반환
    const existingComment = await this.commentModel
      .findByIdAndUpdate(id, { $set: { ...updateCommentDto, updatedAt: new Date() } }, { new: true })
      .exec();

    // 댓글이 없으면 예외 발생
    if (!existingComment) {
      throw new NotFoundException(`ID "${id}"를 가진 댓글을 찾을 수 없습니다.`);
    }
    return existingComment;
  }

  // 댓글 삭제
  async remove(id: string): Promise<{ message: string }> {
    // 댓글 삭제
    const result = await this.commentModel.deleteOne({ _id: id }).exec();
    
    // 삭제된 문서가 없으면 예외 발생
    if (result.deletedCount === 0) {
      throw new NotFoundException(`ID "${id}"를 가진 댓글을 찾을 수 없습니다.`);
    }
    return { message: '댓글이 성공적으로 삭제되었습니다.' };
  }
}
