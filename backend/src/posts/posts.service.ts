// 필요 의존성 주입 코드

// 이 데코레이터는 클래스가 Nest.js의 의존성 주입(DI) 시스템에 의해 관리될 수 있음을 표시합니다.
import { Injectable } from '@nestjs/common';
// Mongoose를 사용하여 MongoDB와 상호작용하기 위한 의존성 주입
import { InjectModel } from '@nestjs/mongoose';
// 데이터베이스와 상호작용(생성, 조회, 수정, 삭제)하는 데 사용되는 객체의 타입입니다.
import { Model } from 'mongoose';
// Post 모델과 관련된 타입을 가져옵니다.
import { Post, PostDocument } from './schemas/post.schema';
// PostsService 클래스는 게시글과 관련된 비즈니스 로직을 처리합니다.
import { CreatePostDto } from './dto/create-post.dto';

// @Injectable() 데코레이터는 PostsService 클래스가 다른 곳(예: PostsController)에 주입될 수 있는 Provider임을 선언합니다.
@Injectable()

// 게시글과 관련된 핵심 비즈니스 로직을 이 클래스 안에서 처리합니다.
export class PostsService {
  /**
   * PostsService 클래스의 생성자(constructor)입니다. 클래스의 인스턴스가 생성될 때 처음으로 호출됩니다.
   * Nest.js의 의존성 주입 시스템이 이 생성자를 통해 필요한 의존성(여기서는 Post 모델)을 자동으로 주입해 줍니다.
   * @param postModel - Mongoose 모델로, Post 스키마를 기반으로 MongoDB와 상호작용할 수 있게 해줍니다.
   */
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  // --- 비즈니스 로직 메소드 ---

  /**
   * 'create'라는 이름의 비동기(async) 메소드를 정의합니다. 컨트롤러로부터 호출되어 실제 게시글 생성 로직을 수행합니다.
   * createPostDto 매개변수는 클라이언트가 보낸 게시글 데이터를 담고 있으며, 타입은 CreatePostDto 입니다.
   * 이 메소드는 Promise<Post>를 반환 타입으로 가집니다. 이는 비동기 작업이 완료된 후 Post 타입의 객체를 반환하겠다는 약속입니다.
   * @param createPostDto dto - 게시글 생성에 필요한 데이터가 담긴 객체입니다.
   * @returns Post - 생성된 게시글 객체를 반환합니다.
   */
  async create(createPostDto: CreatePostDto): Promise<Post> {
    /*
      new this.postModel(createPostDto) 코드는 주입받은 Post 모델을 사용해 새로운 문서(document) 인스턴스를 생성합니다.
      DTO에 담겨온 데이터(제목, 내용 등)가 이 인스턴스에 채워집니다.
    */
    const createdPost = new this.postModel(createPostDto);
    return createdPost.save();
  }

  // ... findAll, findById 등 다른 메소드들
}
