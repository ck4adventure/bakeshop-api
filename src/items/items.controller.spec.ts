// items.controller.spec.ts
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { setupControllerTest } from '../../test/utils/setup-controller-test';

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
      const result = {
        id: 1,
        name: 'New Item',
        slug: 'new-item',
        createdAt: now,
        updatedAt: now,
      };
      const spy = jest.spyOn(service, 'create').mockResolvedValue(result);

      await expect(controller.create(dto)).resolves.toEqual(result);
      expect(spy).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should call itemService.findAll and return its result', async () => {
      const now = new Date();
      const result = [
        {
          id: 1,
          name: 'Item 1',
          slug: 'item-1',
          createdAt: now,
          updatedAt: now,
        },
      ];
      const spy = jest.spyOn(service, 'findAll').mockResolvedValue(result);

      await expect(controller.findAll()).resolves.toEqual(result);
      expect(spy).toHaveBeenCalled();
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

  describe('findOne', () => {
    it('should call itemService.findOne and return its result', async () => {
      const now = new Date();
      const result = {
        id: 1,
        name: 'Item 1',
        slug: 'item-1',
        createdAt: now,
        updatedAt: now,
      };
      const spy = jest.spyOn(service, 'findOne').mockResolvedValue(result);

      await expect(controller.findOne('1')).resolves.toEqual(result);
      expect(spy).toHaveBeenCalledWith('1');
    });

    it('should propagate errors thrown by itemService.findOne', async () => {
      const error = new Error('Not found');
      jest.spyOn(service, 'findOne').mockRejectedValue(error);

      await expect(controller.findOne('1')).rejects.toThrow('Not found');
    });
  });

  describe('update', () => {
    it('should call itemService.update and return its result', async () => {
      const now = new Date();
      const dto = { id: '1', name: 'Updated Item' };
      const result = {
        id: 1,
        name: 'Updated Item',
        slug: 'updated-item',
        createdAt: now,
        updatedAt: now,
      };
      const spy = jest.spyOn(service, 'update').mockResolvedValue(result);

      await expect(controller.update('1', dto)).resolves.toEqual(result);
      expect(spy).toHaveBeenCalledWith('1', dto);
    });

    it('should propagate errors thrown by itemService.update', async () => {
      const error = new Error('Update error');
      jest.spyOn(service, 'update').mockRejectedValue(error);

      await expect(
        controller.update('1', { id: '1', name: 'Updated Item' }),
      ).rejects.toThrow('Update error');
    });
  });

  describe('remove', () => {
    it('should call itemService.remove and return its result', async () => {
      const now = new Date();
      const result = {
        id: 1,
        name: 'Deleted Item',
        slug: 'deleted-item',
        createdAt: now,
        updatedAt: now,
      };
      const spy = jest.spyOn(service, 'remove').mockResolvedValue(result);

      await expect(controller.remove('1')).resolves.toEqual(result);
      expect(spy).toHaveBeenCalledWith('1');
    });

    it('should propagate errors thrown by itemService.remove', async () => {
      const error = new Error('Delete error');
      jest.spyOn(service, 'remove').mockRejectedValue(error);

      await expect(controller.remove('1')).rejects.toThrow('Delete error');
    });
  });
});
