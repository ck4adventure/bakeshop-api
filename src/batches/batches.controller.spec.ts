import { Test, TestingModule } from '@nestjs/testing';
import { BatchesController } from './batches.controller';
import { BatchesService } from './batches.service';
import { Prisma } from '@prisma/client';
import { PrismaClient } from 'generated/prisma';
import { InventoryReason } from '@prisma/client';

describe('BatchesController', () => {
  let controller: BatchesController;
  let service: BatchesService;

  beforeEach(async () => {
    const mockBatchesService = {
      createBatch: jest.fn(),
    };

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
      const result = {
        itemId: 1,
        quantity: 10,
        reason: InventoryReason.BATCH,
        createdAt: new Date(),
        id: 1,
      };
      const spy = jest.spyOn(service, 'createBatch').mockResolvedValue(result);

      await expect(controller.createBatch(body)).resolves.toMatchObject({
        itemId: 1,
        quantity: 10,
        reason: InventoryReason.BATCH,
        createdAt: expect.any(Date),
        id: 1,
      });
      expect(spy).toHaveBeenCalledWith(body);
    });

    it('should propagate errors thrown by batchesService.createBatch', async () => {
      const body = { itemId: 1, quantity: 10 };
      const error = new Error('Inventory error');
      jest.spyOn(service, 'createBatch').mockRejectedValue(error);

      await expect(controller.createBatch(body)).rejects.toThrow(
        'Inventory error',
      );
    });
  });
});
