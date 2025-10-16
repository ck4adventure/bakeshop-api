import { Test, TestingModule } from '@nestjs/testing';
import { ProductionScheduleController } from './production_schedule.controller';
import { ProductionScheduleService } from './production_schedule.service';

describe('ProductionScheduleController', () => {
  let controller: ProductionScheduleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductionScheduleController],
      providers: [ProductionScheduleService],
    }).compile();

    controller = module.get<ProductionScheduleController>(ProductionScheduleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
