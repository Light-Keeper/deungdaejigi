import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WelfareService } from './welfare.service';
import { CreateWelfareDto } from './dto/create-welfare.dto';
import { UpdateWelfareDto } from './dto/update-welfare.dto';

@Controller('welfare')
export class WelfareController {
  constructor(private readonly welfareService: WelfareService) {}

  @Post()
  create(@Body() createWelfareDto: CreateWelfareDto) {
    return this.welfareService.create(createWelfareDto);
  }

  @Get()
  findAll() {
    return this.welfareService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.welfareService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWelfareDto: UpdateWelfareDto) {
    return this.welfareService.update(+id, updateWelfareDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.welfareService.remove(+id);
  }
}
