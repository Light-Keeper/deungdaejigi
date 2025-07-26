import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WelfareService } from './welfare.service';
import { WelfareController } from './welfare.controller';
import {
  WelfareService as WelfareServiceModel,
  WelfareServiceSchema,
} from './schemas/welfare.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WelfareServiceModel.name, schema: WelfareServiceSchema },
    ]),
  ],
  controllers: [WelfareController],
  providers: [WelfareService],
})
export class WelfareModule {}
