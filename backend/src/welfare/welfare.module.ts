import { Module } from '@nestjs/common';
import { WelfareService } from './welfare.service';
import { WelfareController } from './welfare.controller';

@Module({
  controllers: [WelfareController],
  providers: [WelfareService],
})
export class WelfareModule {}
