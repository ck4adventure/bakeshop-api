// items.controller.spec.ts
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { setupControllerTest } from '../../test/utils/setup-controller-test';

const BAKERY_ID = 'bakery-uuid-1';
const mockReq = { user: { bakeryId: BAKERY_ID } };

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

    ({ controller, service } = await setupControllerTest(
      ItemsController,
      ItemsService,
      mockItemService,
    ));
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call itemService.create and return its result', async () => {
      const now = new Date();
      const dto = { name: 'New Item' };
      const result = { id: 1, name: 'New Item', slug: 'new-item', bakeryId: BAKERY_ID, par: null, defaultBatchQty: null, createdAt: now, updatedAt: now };
      const spy = jest.spyOn(service, 'create').mockResolvedValue(result);

      await expect(controller.create(dto, mockReq)).resolves.toEqual(result);
      expect(spy).toHaveBeenCalledWith(dto, BAKERY_ID);
    });
  });

  describe('findAll', () => {
    it('should call itemService.findAll and return its result', async () => {
      const now = new Date();
      const result = [{ id: 1, name: 'Item 1', slug: 'item-1', bakeryId: BAKERY_ID, par: null, defaultBatchQty: null, createdAt: now, updatedAt: now }];
      const spy = jest.spyOn(service, 'findAll').mockResolvedValue(result);

      await expect(controller.findAll(mockReq)).resolves.toEqual(result);
      expect(spy).toHaveBeenCalledWith(BAKERY_ID);
    });

    it('should return an empty array if itemService.findAll returns empty', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([]);
      await expect(controller.findAll(mockReq)).resolves.toEqual([]);
    });

    it('should propagate errors thrown by itemService.findAll', async () => {
      jest.spyOn(service, 'findAll').mockRejectedValue(new Error('Database error'));
      await expect(controller.findAll(mockReq)).rejects.toThrow('Database error');
    });
  });

  describe('findOne', () => {
    it('should call itemService.findOne and return its result', async () => {
      const now = new Date();
      const result = { id: 1, name: 'Item 1', slug: 'item-1', bakeryId: BAKERY_ID, par: null, defaultBatchQty: null, createdAt: now, updatedAt: now };
      const spy = jest.spyOn(service, 'findOne').mockResolvedValue(result);

      await expect(controller.findOne('item-1', mockReq)).resolves.toEqual(result);
      expect(spy).toHaveBeenCalledWith('item-1', BAKERY_ID);
    });

    it('should propagate errors thrown by itemService.findOne', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new Error('Not found'));
      await expect(controller.findOne('item-1', mockReq)).rejects.toThrow('Not found');
    });
  });

  describe('update', () => {
    it('should call itemService.update and return its result', async () => {
      const now = new Date();
      const dto = { id: '1', name: 'Updated Item' };
      const result = { id: 1, name: 'Updated Item', slug: 'updated-item', bakeryId: BAKERY_ID, par: null, defaultBatchQty: null, createdAt: now, updatedAt: now };
      const spy = jest.spyOn(service, 'update').mockResolvedValue(result);

      await expect(controller.update('item-1', dto, mockReq)).resolves.toEqual(result);
      expect(spy).toHaveBeenCalledWith('item-1', dto, BAKERY_ID);
    });

    it('should propagate errors thrown by itemService.update', async () => {
      jest.spyOn(service, 'update').mockRejectedValue(new Error('Update error'));
      await expect(controller.update('item-1', { id: '1', name: 'x' }, mockReq)).rejects.toThrow('Update error');
    });
  });

  describe('remove', () => {
    it('should call itemService.remove and return its result', async () => {
      const now = new Date();
      const result = { id: 1, name: 'Deleted Item', slug: 'deleted-item', bakeryId: BAKERY_ID, par: null, defaultBatchQty: null, createdAt: now, updatedAt: now };
      const spy = jest.spyOn(service, 'remove').mockResolvedValue(result);

      await expect(controller.remove('1', mockReq)).resolves.toEqual(result);
      expect(spy).toHaveBeenCalledWith('1', BAKERY_ID);
    });

    it('should propagate errors thrown by itemService.remove', async () => {
      jest.spyOn(service, 'remove').mockRejectedValue(new Error('Delete error'));
      await expect(controller.remove('1', mockReq)).rejects.toThrow('Delete error');
    });
  });
});
