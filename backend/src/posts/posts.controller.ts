// src/posts/posts.controller.ts

/**
 * 🎯 게시글 컨트롤러 - 타입 에러 해결 버전
 * 
 * 🔧 수정 사항:
 * - 별도 DTO 파일 사용으로 타입 에러 해결
 * - 쿼리 파라미터 안전한 처리
 * - undefined 타입 문제 해결
 */

import { 
  Controller, 
  Post, 
  Get,
  Body, 
  Param,
  Query,
  UseGuards, 
  Req 
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { FindAllPostsQueryDto } from './dto/find-all-post.dto'; // 🆕 새로 추가

/**
 * 🔍 JWT 사용자 정보 타입
 */
interface JwtUser {
  userId: string;
  username: string;
}

/**
 * 🔍 JWT 인증된 Request 타입
 */
interface AuthenticatedRequest extends Request {
  user: JwtUser;
}

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  /**
   * 📝 게시글 작성 API (기존과 동일)
   */
  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(
    @Body() createPostDto: CreatePostDto,
    @Req() req: AuthenticatedRequest
  ) {
    const userId = req.user.userId;
    const authorNickname = req.user.username;
    
    return this.postsService.create({
      ...createPostDto,
      userId,
      authorNickname,
    });
  }

  /**
   * 📋 게시글 목록 조회 API (타입 에러 해결)
   * 
   * 🔧 개선 사항:
   * - FindAllPostsQueryDto 사용으로 타입 안전성 보장
   * - undefined 처리 개선
   * - 기본값 설정 명확화
   */
  @Get()
  findAll(@Query() query: FindAllPostsQueryDto) {
    /**
     * 📊 쿼리 파라미터 안전한 처리
     * 
     * 🔧 타입 에러 해결:
     * - string | undefined → number 변환 시 안전 처리
     * - || 연산자로 기본값 보장
     * - parseInt() NaN 처리
     */
    
    // 📄 페이지 번호 처리 (기본값: 1)
    const pageStr = query.page;
    const page = pageStr ? parseInt(pageStr, 10) : 1;
    const safePage = isNaN(page) || page < 1 ? 1 : page;

    // 📊 페이지당 개수 처리 (기본값: 10)
    const limitStr = query.limit;
    const limit = limitStr ? parseInt(limitStr, 10) : 10;
    const safeLimit = isNaN(limit) || limit < 1 ? 10 : limit > 100 ? 100 : limit; // 최대 100개 제한

    // 🏷️ 카테고리 처리 (undefined 허용)
    const category = query.category;

    // 📈 정렬 방식 처리 (기본값: 'latest')
    const sort = query.sort || 'latest';

    /**
     * 🚀 서비스 호출 (타입 안전)
     * 
     * 💡 모든 값이 확정된 상태로 전달
     * - page: number (확정)
     * - limit: number (확정)  
     * - category: string | undefined (허용)
     * - sort: string (확정)
     */
    return this.postsService.findAll({
      page: safePage,
      limit: safeLimit,
      category, // undefined 허용됨
      sort,
    });
  }

  /**
   * 🔍 특정 게시글 조회 API (기존과 동일)
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  /**
   * 📊 추가 개선 사항 (주석으로 표시):
   * 
   * 🔍 쿼리 파라미터 검증 강화:
   * @Get()
   * @UsePipes(new ValidationPipe({ transform: true }))
   * findAll(@Query() query: FindAllPostsQueryDto) {
   *   // ValidationPipe가 자동으로 타입 변환 및 검증
   * }
   * 
   * 📋 Swagger 문서화:
   * @ApiQuery({ name: 'page', required: false, type: Number })
   * @ApiQuery({ name: 'limit', required: false, type: Number })
   * @ApiQuery({ name: 'category', required: false, type: String })
   * @ApiQuery({ name: 'sort', required: false, enum: ['latest', 'popular', 'oldest'] })
   */
}