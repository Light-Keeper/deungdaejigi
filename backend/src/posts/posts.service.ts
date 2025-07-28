// src/posts/posts.service.ts

/**
 * 🏢 게시글 서비스 - 타입 에러 해결 버전
 * 
 * 🔧 수정 사항:
 * - 별도 DTO 파일의 인터페이스 사용
 * - FindAllResult → FindAllPostsResult
 * - FindAllOptions → FindAllPostsOptions
 * - 타입 안전성 보장
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { 
  FindAllPostsOptions, 
  FindAllPostsResult 
} from './dto/find-all-post.dto'; // 🆕 별도 파일에서 import

/**
 * 🔍 게시글 생성 시 사용할 데이터 타입
 */
interface CreatePostWithAuth extends CreatePostDto {
  userId: string;
  authorNickname: string;
}

@Injectable()
export class PostsService {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  /**
   * 📝 게시글 생성 메서드 (기존과 동일)
   */
  async create(data: CreatePostWithAuth): Promise<Post> {
    const { userId, title, content, category, authorNickname } = data;

    const createdPost = new this.postModel({
      userId,
      title,
      content,
      category,
      authorNickname,
      likeCount: 0,
      commentCount: 0,
    });

    return createdPost.save();
  }

  /**
   * 📋 게시글 목록 조회 메서드 (타입 에러 해결)
   * 
   * 🔧 개선 사항:
   * - FindAllPostsOptions 타입 사용
   * - FindAllPostsResult 반환 타입 명시
   * - 타입 안전성 보장
   * 
   * @param options 조회 옵션 (페이지, 정렬, 필터 등)
   * @returns Promise<FindAllPostsResult> 게시글 목록과 메타 정보
   */
  async findAll(options: FindAllPostsOptions): Promise<FindAllPostsResult> {
    const { page, limit, category, sort } = options;

    /**
     * 🔍 MongoDB 쿼리 조건 생성
     * 
     * 💡 category가 undefined인 경우 처리
     */
    const filter: any = {};
    if (category && category.trim() !== '') {
      filter.category = category;
    }

    /**
     * 📊 정렬 옵션 설정
     * 
     * 🔧 타입 안전한 정렬 처리
     */
    let sortOption: any = { createdAt: -1 }; // 기본값: 최신순

    switch (sort) {
      case 'popular':
        // 인기순: 좋아요 수 + 댓글 수 + 최신순
        sortOption = { 
          likeCount: -1, 
          commentCount: -1, 
          createdAt: -1 
        };
        break;
      
      case 'oldest':
        // 오래된 순: 생성일 오름차순
        sortOption = { createdAt: 1 };
        break;
      
      case 'latest':
      default:
        // 최신순: 생성일 내림차순 (기본값)
        sortOption = { createdAt: -1 };
        break;
    }

    /**
     * 📊 페이지네이션 계산
     * 
     * 💡 안전한 계산 (음수 방지)
     */
    const skip = Math.max(0, (page - 1) * limit);

    try {
      /**
       * 🚀 병렬 쿼리 실행
       * 
       * 💡 Promise.all로 성능 최적화
       */
      const [posts, totalCount] = await Promise.all([
        // 📋 게시글 목록 조회
        this.postModel
          .find(filter)
          .sort(sortOption)
          .skip(skip)
          .limit(limit)
          .exec(),

        // 🔢 전체 게시글 수 조회
        this.postModel.countDocuments(filter).exec(),
      ]);

      /**
       * 📊 메타 정보 계산 (안전한 계산)
       */
      const totalPages = Math.max(1, Math.ceil(totalCount / limit));
      const currentPage = Math.min(page, totalPages); // 현재 페이지가 총 페이지를 초과하지 않도록
      const hasNextPage = currentPage < totalPages;
      const hasPrevPage = currentPage > 1;

      /**
       * 📦 타입 안전한 결과 반환
       * 
       * 💡 FindAllPostsResult 인터페이스와 정확히 매치
       */
      const result: FindAllPostsResult = {
        posts,
        totalCount,
        totalPages,
        currentPage,
        hasNextPage,
        hasPrevPage,
      };

      return result;

    } catch (error) {
      /**
       * 🚨 에러 처리
       * 
       * 💡 MongoDB 쿼리 에러 시 로깅 후 재발생
       */
      console.error('게시글 조회 중 오류 발생:', error);
      throw error;
    }
  }

  /**
   * 🔍 특정 게시글 조회 메서드 (기존과 동일)
   */
  async findOne(id: string): Promise<Post> {
    try {
      /**
       * 🔍 게시글 조회
       * 
       * 💡 ObjectId 유효성은 MongoDB가 자동 처리
       */
      const post = await this.postModel.findById(id).exec();

      /**
       * 🚨 존재하지 않는 게시글 처리
       */
      if (!post) {
        throw new NotFoundException(`ID가 ${id}인 게시글을 찾을 수 없습니다.`);
      }

      return post;

    } catch (error) {
      /**
       * 🚨 에러 재처리
       * 
       * 💡 NotFoundException은 그대로 전달
       * 다른 에러는 로깅 후 전달
       */
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      console.error('게시글 조회 중 오류 발생:', error);
      throw new NotFoundException(`게시글 조회 중 오류가 발생했습니다.`);
    }
  }

  /**
   * 📊 추가 개선 사항 (주석으로 표시):
   * 
   * 🔍 검색 기능:
   * async search(keyword: string, options: FindAllPostsOptions): Promise<FindAllPostsResult> {
   *   const filter = {
   *     $or: [
   *       { title: { $regex: keyword, $options: 'i' } },
   *       { content: { $regex: keyword, $options: 'i' } }
   *     ]
   *   };
   *   // ... 검색 로직
   * }
   * 
   * 📈 조회수 증가:
   * async incrementView(id: string): Promise<void> {
   *   await this.postModel.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });
   * }
   * 
   * 👥 작성자 정보 포함:
   * async findWithAuthor(id: string): Promise<Post> {
   *   return this.postModel.findById(id).populate('userId', 'username nickname').exec();
   * }
   */
}