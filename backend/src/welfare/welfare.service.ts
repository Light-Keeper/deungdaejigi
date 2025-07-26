import { Injectable } from '@nestjs/common';
import { CreateWelfareDto } from './dto/create-welfare.dto';
import { UpdateWelfareDto } from './dto/update-welfare.dto';

@Injectable()
export class WelfareService {
  create(createWelfareDto: CreateWelfareDto) {
    return 'This action adds a new welfare';
  }

  findAll() {
    return `This action returns all welfare`;
  }

  findOne(id: number) {
    return `This action returns a #${id} welfare`;
  }

  update(id: number, updateWelfareDto: UpdateWelfareDto) {
    return `This action updates a #${id} welfare`;
  }

  remove(id: number) {
    return `This action removes a #${id} welfare`;
  }
}
