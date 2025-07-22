import { Test, TestingModule } from '@nestjs/testing';
import { MentalService } from './mental.service';

describe('MentalService', () => {
  let service: MentalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MentalService],
    }).compile();

    service = module.get<MentalService>(MentalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
