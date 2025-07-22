import { Module } from '@nestjs/common';
import { MentalController } from './mental.controller';
import { MentalService } from './mental.service';

@Module({
  controllers: [MentalController],
  providers: [MentalService]
})
export class MentalModule {}
