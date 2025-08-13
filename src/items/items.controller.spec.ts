import { Test, TestingModule } from '@nestjs/testing';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';

describe('ItemController', () => {
  let controller: ItemsController;
  let service: ItemsService;

  beforeEach(async () => {
    const mockItemService = {
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemsController],
      providers: [{ provide: ItemsService, useValue: mockItemService }],
    }).compile();

    controller = module.get<ItemsController>(ItemsController);
    service = module.get<ItemsService>(ItemsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call itemService.findAll and return its result', async () => {
      const result = [{ id: '1', name: 'Item 1' }];
      jest.spyOn(service, 'findAll').mockResolvedValue(result);

      await expect(controller.findAll()).resolves.toBe(result);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should return an empty array if itemService.findAll returns empty', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([]);
      await expect(controller.findAll()).resolves.toEqual([]);
    });

    it('should propagate errors thrown by itemService.findAll', async () => {
      const error = new Error('Database error');
      jest.spyOn(service, 'findAll').mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow('Database error');
    });
  });
});
