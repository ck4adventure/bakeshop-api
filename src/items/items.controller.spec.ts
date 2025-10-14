import { Test, TestingModule } from '@nestjs/testing';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';

describe('ItemsController', () => {
  let controller: ItemsController;
  let service: ItemsService;

  beforeEach(async () => {
    const mockItemService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
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

  describe('create', () => {
    it('should call itemService.create and return its result', async () => {
      const dto = { name: 'New Item' };
      const result = { id: '1', name: 'New Item' };
      (service.create as jest.Mock).mockResolvedValue(result);
      await expect(controller.create(dto)).resolves.toEqual(result);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should call itemService.findAll and return its result', async () => {
      const result = [{ id: '1', name: 'Item 1' }];
      (service.findAll as jest.Mock).mockResolvedValue(result);
      await expect(controller.findAll()).resolves.toEqual(result);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should return an empty array if itemService.findAll returns empty', async () => {
      (service.findAll as jest.Mock).mockResolvedValue([]);
      await expect(controller.findAll()).resolves.toEqual([]);
    });

    it('should propagate errors thrown by itemService.findAll', async () => {
      const error = new Error('Database error');
      (service.findAll as jest.Mock).mockRejectedValue(error);
      await expect(controller.findAll()).rejects.toThrow('Database error');
    });
  });

  describe('findOne', () => {
    it('should call itemService.findOne and return its result', async () => {
      const result = { id: '1', name: 'Item 1' };
      (service.findOne as jest.Mock).mockResolvedValue(result);
      await expect(controller.findOne('1')).resolves.toEqual(result);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });

    it('should propagate errors thrown by itemService.findOne', async () => {
      const error = new Error('Not found');
      (service.findOne as jest.Mock).mockRejectedValue(error);
      await expect(controller.findOne('1')).rejects.toThrow('Not found');
    });
  });

  describe('update', () => {
    it('should call itemService.update and return its result', async () => {
      const dto = { id: '1', name: 'Updated Item' };
      const result = { id: '1', name: 'Updated Item' };
      (service.update as jest.Mock).mockResolvedValue(result);
      await expect(controller.update('1', dto)).resolves.toEqual(result);
      expect(service.update).toHaveBeenCalledWith('1', dto);
    });

    it('should propagate errors thrown by itemService.update', async () => {
      const error = new Error('Update error');
      (service.update as jest.Mock).mockRejectedValue(error);
      await expect(controller.update('1', { id: '1', name: 'Updated Item' })).rejects.toThrow('Update error');
    });
  });

  describe('remove', () => {
    it('should call itemService.remove and return its result', async () => {
      const result = { id: '1', name: 'Deleted Item' };
      (service.remove as jest.Mock).mockResolvedValue(result);
      await expect(controller.remove('1')).resolves.toEqual(result);
      expect(service.remove).toHaveBeenCalledWith('1');
    });

    it('should propagate errors thrown by itemService.remove', async () => {
      const error = new Error('Delete error');
      (service.remove as jest.Mock).mockRejectedValue(error);
      await expect(controller.remove('1')).rejects.toThrow('Delete error');
    });
  });
});
