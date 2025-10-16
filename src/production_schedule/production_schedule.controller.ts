import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductionScheduleService } from './production_schedule.service';
import { CreateProductionScheduleDto } from './dto/create-production_schedule.dto';
import { UpdateProductionScheduleDto } from './dto/update-production_schedule.dto';

@Controller('production-schedule')
export class ProductionScheduleController {
  constructor(private readonly productionScheduleService: ProductionScheduleService) {}

  @Post()
  create(@Body() createProductionScheduleDto: CreateProductionScheduleDto) {
    return this.productionScheduleService.create(createProductionScheduleDto);
  }

  @Get()
  findAll() {
    return this.productionScheduleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productionScheduleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductionScheduleDto: UpdateProductionScheduleDto) {
    return this.productionScheduleService.update(+id, updateProductionScheduleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productionScheduleService.remove(+id);
  }
}
