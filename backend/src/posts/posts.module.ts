// src/posts/posts.module.ts

/**
 * 🏗️ 게시글 모듈 - 완전한 CRUD 기능
 * 
 * 🎯 제공 기능:
 * - 게시글 작성 (JWT 인증)
 * - 게시글 목록 조회 (공개)
 * - 특정 게시글 조회 (공개)
 * - 페이지네이션 및 정렬
 * - 카테고리별 필터링
 */

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { Post, PostSchema } from './schemas/post.schema';

@Module({
  imports: [
    /**
     * 🗄️ MongoDB 스키마 등록
     * 
     * 📊 등록 정보:
     * - 모델명: 'Post'
     * - 스키마: PostSchema
     * - 실제 컬렉션: 'posts'
     * 
     * 🔄 이렇게 등록하면:
     * - PostsService에서 @InjectModel(Post.name) 사용 가능
     * - MongoDB 'posts' 컬렉션과 자동 매핑
     * - CRUD 작업 수행 가능
     */
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
    ]),

    /**
     * 🔐 Passport 모듈 (JWT 인증용)
     * 
     * 🎯 용도:
     * - 게시글 작성 시 JWT 가드 사용
     * - @UseGuards(AuthGuard('jwt')) 활성화
     * - jwt.strategy.ts와 연동
     * 
     * 💡 게시글 조회는 인증 불필요하지만,
     *    향후 수정/삭제 기능에서 필요함
     */
    PassportModule,
  ],

  /**
   * 🎮 컨트롤러 등록
   * 
   * 📡 PostsController에서 제공하는 엔드포인트:
   * - POST /posts → 게시글 작성 (JWT 필요)
   * - GET /posts → 게시글 목록 조회 (공개)
   * - GET /posts/:id → 특정 게시글 조회 (공개)
   */
  controllers: [PostsController],

  /**
   * 🔧 서비스 등록
   * 
   * 🏢 PostsService 주요 메서드:
   * - create(): 게시글 생성
   * - findAll(): 게시글 목록 조회 (페이지네이션)
   * - findOne(): 특정 게시글 조회
   */
  providers: [PostsService],

  /**
   * 📤 외부 모듈에 제공할 서비스
   * 
   * 💡 현재는 비어있음 = 외부에서 PostsService 직접 사용 안 함
   * 
   * 📋 향후 추가 가능한 경우:
   * - CommentModule에서 게시글 정보 필요 시
   * - NotificationModule에서 게시글 알림 필요 시
   * - exports: [PostsService] 추가
   */
})
export class PostsModule {
  /**
   * 📊 현재 모듈에서 제공하는 API 요약:
   * 
   * 🔐 인증 필요 (JWT 토큰):
   * - POST /posts
   * 
   * 🌍 공개 (인증 불필요):
   * - GET /posts
   * - GET /posts/:id
   * 
   * 🎯 특별한 기능:
   * - 페이지네이션: ?page=1&limit=10
   * - 카테고리 필터: ?category=질문
   * - 정렬 옵션: ?sort=popular
   * 
   * 📋 향후 확장 계획:
   * - PUT /posts/:id (수정)
   * - DELETE /posts/:id (삭제)
   * - POST /posts/:id/like (좋아요)
   * - GET /posts/my (내 게시글)
   * - GET /posts/search (검색)
   */
}