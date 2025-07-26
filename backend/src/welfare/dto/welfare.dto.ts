import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  IsUrl,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateWelfareDto {
  @IsString()
  name: string;

  @IsString()
  provider: string;

  @IsString()
  description: string;

  @IsString()
  eligibility: string;

  @IsString()
  applicationMethod: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  requiredDocuments: string[];

  @IsString()
  @IsOptional()
  contact: string;

  @IsUrl()
  @IsOptional()
  applicationUrl: string;

  @IsString()
  mainCategory: string;

  @IsString()
  subCategory: string;

  @IsDateString()
  @IsOptional()
  applicationStartDate: Date;

  @IsDateString()
  @IsOptional()
  applicationEndDate: Date;
}

export class UpdateWelfareDto extends PartialType(CreateWelfareDto) {}
