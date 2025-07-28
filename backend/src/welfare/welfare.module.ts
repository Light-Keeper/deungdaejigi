import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { WelfareService } from './welfare.service';
import { WelfareController } from './welfare.controller';
import { Welfare, WelfareSchema } from './schemas/welfare.schema';
import { WelfareProviderType } from './enum/welfare-provider-type.enum';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Welfare.name, schema: WelfareSchema }]),
    HttpModule,
  ],
  controllers: [WelfareController],
  providers: [WelfareService],
})
export class WelfareModule {}
