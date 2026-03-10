import { Test, TestingModule } from '@nestjs/testing';
import { ProductionScheduleService } from './production_schedule.service';

describe('ProductionScheduleService', () => {
  let service: ProductionScheduleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductionScheduleService],
    }).compile();

    service = module.get<ProductionScheduleService>(ProductionScheduleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
