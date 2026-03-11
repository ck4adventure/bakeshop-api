import { Test, TestingModule } from '@nestjs/testing';
import { BatchesController } from './batches.controller';
import { BatchesService } from './batches.service';
import { InventoryReason } from '@prisma/client';

const BAKERY_ID = 'bakery-uuid-1';
const mockReq = { user: { bakeryId: BAKERY_ID } };

describe('BatchesController', () => {
  let controller: BatchesController;
  let service: BatchesService;

  beforeEach(async () => {
    const mockBatchesService = { createBatch: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BatchesController],
      providers: [{ provide: BatchesService, useValue: mockBatchesService }],
    }).compile();

    controller = module.get<BatchesController>(BatchesController);
    service = module.get<BatchesService>(BatchesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createBatch', () => {
    it('should call batchesService.createBatch and return its result', async () => {
      const body = { itemId: 1, quantity: 10 };
      const result = { id: 1, itemId: 1, quantity: 10, reason: InventoryReason.BATCH, note: null, createdAt: new Date() };
      const spy = jest.spyOn(service, 'createBatch').mockResolvedValue(result);

      await expect(controller.createBatch(body, mockReq)).resolves.toMatchObject({
        itemId: 1, quantity: 10, reason: InventoryReason.BATCH,
      });
      expect(spy).toHaveBeenCalledWith(body, BAKERY_ID);
    });

    it('should propagate errors thrown by batchesService.createBatch', async () => {
      jest.spyOn(service, 'createBatch').mockRejectedValue(new Error('Inventory error'));
      await expect(controller.createBatch({ itemId: 1, quantity: 10 }, mockReq)).rejects.toThrow('Inventory error');
    });
  });
});
