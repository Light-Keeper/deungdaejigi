import { Test, TestingModule } from '@nestjs/testing';
import { MoodDiaryService } from './mood-diary.service';

describe('MoodDiaryService', () => {
  let service: MoodDiaryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MoodDiaryService],
    }).compile();

    service = module.get<MoodDiaryService>(MoodDiaryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
