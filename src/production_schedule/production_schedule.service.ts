import { Injectable } from '@nestjs/common';
import { CreateProductionScheduleDto } from './dto/create-production_schedule.dto';
import { UpdateProductionScheduleDto } from './dto/update-production_schedule.dto';

@Injectable()
export class ProductionScheduleService {
  create(createProductionScheduleDto: CreateProductionScheduleDto) {
    return 'This action adds a new productionSchedule';
  }

  findAll() {
    return `This action returns all productionSchedule`;
  }

  findOne(id: number) {
    return `This action returns a #${id} productionSchedule`;
  }

  update(id: number, updateProductionScheduleDto: UpdateProductionScheduleDto) {
    return `This action updates a #${id} productionSchedule`;
  }

  remove(id: number) {
    return `This action removes a #${id} productionSchedule`;
  }
}
