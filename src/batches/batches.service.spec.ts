import { Test, TestingModule } from '@nestjs/testing';
import { BatchesService } from './batches.service';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryReason } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateBatchDto } from './dto/create-batch.dto';

describe('BatchesService', () => {
  let service: BatchesService;
  let prisma: {
    item: { findUnique: jest.Mock };
    itemInventory: { upsert: jest.Mock };
    inventoryTransaction: { create: jest.Mock };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      item: { findUnique: jest.fn() },
      itemInventory: { upsert: jest.fn() },
      inventoryTransaction: { create: jest.fn() },
      // Execute the array of queries by calling each, return their results
      $transaction: jest.fn().mockImplementation((ops: Promise<unknown>[]) =>
        Promise.all(ops),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BatchesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<BatchesService>(BatchesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createBatch', () => {
    it('should throw BadRequestException for invalid itemId', async () => {
      await expect(
        service.createBatch({ itemId: 0, quantity: 10 }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.createBatch({ itemId: -1, quantity: 10 }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.createBatch({ itemId: 1.5, quantity: 10 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid quantity', async () => {
      await expect(
        service.createBatch({ itemId: 1, quantity: 0 }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.createBatch({ itemId: 1, quantity: -5 }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.createBatch({ itemId: 1, quantity: 2.5 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if item does not exist', async () => {
      prisma.item.findUnique.mockResolvedValue(null);
      await expect(
        service.createBatch({ itemId: 1, quantity: 10 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update ItemInventory and log an InventoryTransaction atomically', async () => {
      const batch: CreateBatchDto = { itemId: 1, quantity: 10 };
      const now = new Date();

      prisma.item.findUnique.mockResolvedValue({ id: batch.itemId });

      const inventoryResult = { itemId: batch.itemId, quantity: 10, updatedAt: now };
      const transactionResult = {
        id: 2,
        itemId: batch.itemId,
        quantity: batch.quantity,
        reason: InventoryReason.BATCH,
        createdAt: now,
      };

      prisma.itemInventory.upsert.mockResolvedValue(inventoryResult);
      prisma.inventoryTransaction.create.mockResolvedValue(transactionResult);

      const result = await service.createBatch(batch);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.itemInventory.upsert).toHaveBeenCalledWith({
        where: { itemId: batch.itemId },
        update: { quantity: { increment: batch.quantity } },
        create: { itemId: batch.itemId, quantity: batch.quantity },
      });
      expect(prisma.inventoryTransaction.create).toHaveBeenCalledWith({
        data: { itemId: batch.itemId, quantity: batch.quantity, reason: InventoryReason.BATCH },
      });

      // Returns the transaction record
      expect(result).toEqual(transactionResult);
    });

    it('should propagate errors from prisma', async () => {
      const error = new Error('DB connection lost');
      prisma.item.findUnique.mockResolvedValue({ id: 1 });
      prisma.$transaction.mockRejectedValue(error);

      await expect(service.createBatch({ itemId: 1, quantity: 5 })).rejects.toThrow(error);
    });
  });
});
