import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { setupControllerTest } from '../../test/utils/setup-controller-test';

const BAKERY_ID = 'bakery-uuid-1';
const mockReq = { user: { bakeryId: BAKERY_ID } };

describe('InventoryController', () => {
  let controller: InventoryController;
  let service: InventoryService;

  beforeEach(async () => {
    const mockInventoryService = { findAll: jest.fn() };

    ({ controller, service } = await setupControllerTest(
      InventoryController,
      InventoryService,
      mockInventoryService,
    ));
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call inventoryService.findAll and return its result', async () => {
      const now = new Date();
      const result = [{ itemId: 1, quantity: 10, updatedAt: now, item: { name: 'Item 1', slug: 'item-1' } }];
      const spy = jest.spyOn(service, 'findAll').mockResolvedValue(result);

      await expect(controller.findAll(mockReq)).resolves.toEqual(result);
      expect(spy).toHaveBeenCalledWith(BAKERY_ID);
    });

    it('should return an empty array if inventoryService.findAll returns empty', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([]);
      await expect(controller.findAll(mockReq)).resolves.toEqual([]);
    });

    it('should propagate errors thrown by inventoryService.findAll', async () => {
      jest.spyOn(service, 'findAll').mockRejectedValue(new Error('Database error'));
      await expect(controller.findAll(mockReq)).rejects.toThrow('Database error');
    });
  });
});
