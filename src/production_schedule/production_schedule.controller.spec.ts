import { Test, TestingModule } from '@nestjs/testing';
import { Weekday } from '@prisma/client';
import { ProductionScheduleController } from './production_schedule.controller';
import { ProductionScheduleService } from './production_schedule.service';

const mockReq = { user: { bakeryId: 'bakery-1' } };

const mockService = {
  findAll: jest.fn(),
  findByItem: jest.fn(),
  upsert: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('ProductionScheduleController', () => {
  let controller: ProductionScheduleController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductionScheduleController],
      providers: [{ provide: ProductionScheduleService, useValue: mockService }],
    }).compile();

    controller = module.get<ProductionScheduleController>(ProductionScheduleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll delegates to service with bakeryId', async () => {
    mockService.findAll.mockResolvedValue([]);
    await controller.findAll(mockReq);
    expect(mockService.findAll).toHaveBeenCalledWith('bakery-1');
  });

  it('findByItem delegates to service', async () => {
    mockService.findByItem.mockResolvedValue([]);
    await controller.findByItem(1, mockReq);
    expect(mockService.findByItem).toHaveBeenCalledWith(1, 'bakery-1');
  });

  it('upsert delegates to service', async () => {
    const dto = { itemId: 1, weekday: Weekday.Monday, quantity: 10 };
    mockService.upsert.mockResolvedValue(dto);
    await controller.upsert(dto, mockReq);
    expect(mockService.upsert).toHaveBeenCalledWith(dto, 'bakery-1');
  });

  it('update delegates to service', async () => {
    mockService.update.mockResolvedValue({ quantity: 5 });
    await controller.update(1, Weekday.Monday, { quantity: 5 }, mockReq);
    expect(mockService.update).toHaveBeenCalledWith(1, Weekday.Monday, { quantity: 5 }, 'bakery-1');
  });

  it('remove delegates to service', async () => {
    mockService.remove.mockResolvedValue({});
    await controller.remove(1, Weekday.Monday, mockReq);
    expect(mockService.remove).toHaveBeenCalledWith(1, Weekday.Monday, 'bakery-1');
  });
});
