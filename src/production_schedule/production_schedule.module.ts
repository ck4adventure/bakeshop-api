import { Module } from '@nestjs/common';
import { ProductionScheduleService } from './production_schedule.service';
import { ProductionScheduleController } from './production_schedule.controller';

@Module({
  controllers: [ProductionScheduleController],
  providers: [ProductionScheduleService],
})
export class ProductionScheduleModule {}
