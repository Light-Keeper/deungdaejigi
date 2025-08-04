import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RecommendationService } from './recommendation.service';
import { RecommendationController } from './recommendation.controller';
import { Survey, SurveySchema } from './schemas/survey.schema';
import { Welfare, WelfareSchema } from '../welfare/schemas/welfare.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Survey.name, schema: SurveySchema },
      { name: Welfare.name, schema: WelfareSchema }
    ]),
  ],
  controllers: [RecommendationController],
  providers: [RecommendationService],
  exports: [RecommendationService],
})
export class RecommendationModule {}