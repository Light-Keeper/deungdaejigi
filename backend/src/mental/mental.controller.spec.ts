import { Test, TestingModule } from '@nestjs/testing';
import { MentalController } from './mental.controller';

describe('MentalController', () => {
  let controller: MentalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MentalController],
    }).compile();

    controller = module.get<MentalController>(MentalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
