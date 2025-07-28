import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SupportService } from './support.service';
import { SupportController } from './support.controller';
import { SupportInfo, SupportInfoSchema } from './schemas/support-info.schema'; // 스키마 임포트

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SupportInfo.name, schema: SupportInfoSchema }, // SupportInfo 모델 등록
    ]),
  ],
  providers: [SupportService],
  controllers: [SupportController],
})
export class SupportModule {}