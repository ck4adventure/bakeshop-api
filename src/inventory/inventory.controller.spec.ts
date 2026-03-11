import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { setupControllerTest } from '../../test/utils/setup-controller-test';
import { InventoryReason } from '@prisma/client';

const BAKERY_ID = 'bakery-uuid-1';
const mockReq = { user: { bakeryId: BAKERY_ID } };

describe('InventoryController', () => {
  let controller: InventoryController;
  let service: InventoryService;

  beforeEach(async () => {
    const mockInventoryService = {
      findAll: jest.fn(),
      recordAdjustment: jest.fn(),
      recordBake: jest.fn(),
    };

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
      const result = [{ itemId: 1, quantity: 10, updatedAt: now, item: { name: 'Item 1', slug: 'item-1', par: null, defaultBatchQty: null } }];
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

  describe('recordAdjustment', () => {
    it('should call inventoryService.recordAdjustment and return its result', async () => {
      const now = new Date();
      const body = { itemId: 1, quantity: 5, note: 'Recount' };
      const result = { id: 1, itemId: 1, quantity: 5, reason: InventoryReason.ADJUSTMENT, note: 'Recount', createdAt: now };
      const spy = jest.spyOn(service, 'recordAdjustment').mockResolvedValue(result);

      await expect(controller.recordAdjustment(body, mockReq)).resolves.toEqual(result);
      expect(spy).toHaveBeenCalledWith(body.itemId, body.quantity, body.note, BAKERY_ID);
    });

    it('should propagate errors thrown by inventoryService.recordAdjustment', async () => {
      jest.spyOn(service, 'recordAdjustment').mockRejectedValue(new Error('Adjustment error'));
      await expect(controller.recordAdjustment({ itemId: 1, quantity: 5, note: 'x' }, mockReq)).rejects.toThrow('Adjustment error');
    });
  });

  describe('recordBake', () => {
    it('should call inventoryService.recordBake and return its result', async () => {
      const now = new Date();
      const body = { itemId: 1, quantity: 5 };
      const result = { id: 1, itemId: 1, quantity: -5, reason: InventoryReason.BAKE, note: null, createdAt: now };
      const spy = jest.spyOn(service, 'recordBake').mockResolvedValue(result);

      await expect(controller.recordBake(body, mockReq)).resolves.toEqual(result);
      expect(spy).toHaveBeenCalledWith(body.itemId, body.quantity, undefined, BAKERY_ID);
    });

    it('should propagate errors thrown by inventoryService.recordBake', async () => {
      jest.spyOn(service, 'recordBake').mockRejectedValue(new Error('Bake error'));
      await expect(controller.recordBake({ itemId: 1, quantity: 5 }, mockReq)).rejects.toThrow('Bake error');
    });
  });
});
