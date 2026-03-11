/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryReason } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const BAKERY_ID = 'bakery-uuid-1';

describe('InventoryService', () => {
  let service: InventoryService;
  let prisma: {
    item: { findFirst: jest.Mock };
    itemInventory: { findMany: jest.Mock; findUnique: jest.Mock; upsert: jest.Mock; update: jest.Mock };
    inventoryTransaction: { create: jest.Mock };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      item: { findFirst: jest.fn() },
      itemInventory: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
      },
      inventoryTransaction: { create: jest.fn() },
      $transaction: jest.fn().mockImplementation((ops: Promise<unknown>[]) => Promise.all(ops)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return inventory scoped to the bakery', async () => {
      const now = new Date();
      const mockInventory = [{ itemId: 1, quantity: 10, updatedAt: now, item: { name: 'Item 1', slug: 'item-1', par: null, defaultBatchQty: null } }];
      prisma.itemInventory.findMany.mockResolvedValue(mockInventory);

      const result = await service.findAll(BAKERY_ID);
      expect(result).toEqual(mockInventory);
      expect(prisma.itemInventory.findMany).toHaveBeenCalledWith({
        where: { item: { bakeryId: BAKERY_ID } },
        include: { item: { select: { name: true, slug: true, par: true, defaultBatchQty: true } } },
      });
    });

    it('should return empty array if no inventory found', async () => {
      prisma.itemInventory.findMany.mockResolvedValue([]);
      const result = await service.findAll(BAKERY_ID);
      expect(result).toEqual([]);
    });

    it('should throw an error if prisma fails', async () => {
      prisma.itemInventory.findMany.mockRejectedValue(new Error('Database error'));
      await expect(service.findAll(BAKERY_ID)).rejects.toThrow('Database error');
    });
  });

  describe('recordAdjustment', () => {
    it('should throw BadRequestException for invalid itemId', async () => {
      await expect(service.recordAdjustment(0, 5, 'note', BAKERY_ID)).rejects.toThrow(BadRequestException);
      await expect(service.recordAdjustment(-1, 5, 'note', BAKERY_ID)).rejects.toThrow(BadRequestException);
      await expect(service.recordAdjustment(1.5, 5, 'note', BAKERY_ID)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if quantity is zero', async () => {
      await expect(service.recordAdjustment(1, 0, 'note', BAKERY_ID)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if note is empty', async () => {
      await expect(service.recordAdjustment(1, 5, '', BAKERY_ID)).rejects.toThrow(BadRequestException);
      await expect(service.recordAdjustment(1, 5, '   ', BAKERY_ID)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if item does not exist in this bakery', async () => {
      prisma.item.findFirst.mockResolvedValue(null);
      await expect(service.recordAdjustment(1, 5, 'Recount', BAKERY_ID)).rejects.toThrow(NotFoundException);
      expect(prisma.item.findFirst).toHaveBeenCalledWith({ where: { id: 1, bakeryId: BAKERY_ID } });
    });

    it('should throw BadRequestException if adjustment would put stock below zero', async () => {
      prisma.item.findFirst.mockResolvedValue({ id: 1, bakeryId: BAKERY_ID });
      prisma.itemInventory.findUnique.mockResolvedValue({ itemId: 1, quantity: 3 });
      await expect(service.recordAdjustment(1, -5, 'Recount', BAKERY_ID)).rejects.toThrow(BadRequestException);
    });

    it('should upsert inventory and create a transaction atomically', async () => {
      const now = new Date();
      prisma.item.findFirst.mockResolvedValue({ id: 1, bakeryId: BAKERY_ID });
      prisma.itemInventory.findUnique.mockResolvedValue({ itemId: 1, quantity: 10 });

      const inventoryResult = { itemId: 1, quantity: 15, updatedAt: now };
      const transactionResult = { id: 1, itemId: 1, quantity: 5, reason: InventoryReason.ADJUSTMENT, note: 'Recount', createdAt: now };
      prisma.itemInventory.upsert.mockResolvedValue(inventoryResult);
      prisma.inventoryTransaction.create.mockResolvedValue(transactionResult);

      const result = await service.recordAdjustment(1, 5, 'Recount', BAKERY_ID);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.itemInventory.upsert).toHaveBeenCalledWith({
        where: { itemId: 1 },
        update: { quantity: { increment: 5 } },
        create: { itemId: 1, quantity: 5 },
      });
      expect(prisma.inventoryTransaction.create).toHaveBeenCalledWith({
        data: { itemId: 1, quantity: 5, reason: InventoryReason.ADJUSTMENT, note: 'Recount' },
      });
      expect(result).toEqual(transactionResult);
    });

    it('should propagate errors from prisma', async () => {
      prisma.item.findFirst.mockResolvedValue({ id: 1, bakeryId: BAKERY_ID });
      prisma.itemInventory.findUnique.mockResolvedValue({ itemId: 1, quantity: 10 });
      prisma.$transaction.mockRejectedValue(new Error('DB error'));
      await expect(service.recordAdjustment(1, 5, 'Recount', BAKERY_ID)).rejects.toThrow('DB error');
    });
  });

  describe('recordBake', () => {
    it('should throw BadRequestException for invalid itemId', async () => {
      await expect(service.recordBake(0, 5, undefined, BAKERY_ID)).rejects.toThrow(BadRequestException);
      await expect(service.recordBake(-1, 5, undefined, BAKERY_ID)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid quantity', async () => {
      await expect(service.recordBake(1, 0, undefined, BAKERY_ID)).rejects.toThrow(BadRequestException);
      await expect(service.recordBake(1, -3, undefined, BAKERY_ID)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if item does not exist in this bakery', async () => {
      prisma.item.findFirst.mockResolvedValue(null);
      await expect(service.recordBake(1, 5, undefined, BAKERY_ID)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if bake quantity exceeds stock', async () => {
      prisma.item.findFirst.mockResolvedValue({ id: 1, bakeryId: BAKERY_ID });
      prisma.itemInventory.findUnique.mockResolvedValue({ itemId: 1, quantity: 3 });
      await expect(service.recordBake(1, 5, undefined, BAKERY_ID)).rejects.toThrow(BadRequestException);
    });

    it('should decrement inventory and create a transaction atomically', async () => {
      const now = new Date();
      prisma.item.findFirst.mockResolvedValue({ id: 1, bakeryId: BAKERY_ID });
      prisma.itemInventory.findUnique.mockResolvedValue({ itemId: 1, quantity: 10 });

      const inventoryResult = { itemId: 1, quantity: 5, updatedAt: now };
      const transactionResult = { id: 1, itemId: 1, quantity: -5, reason: InventoryReason.BAKE, note: null, createdAt: now };
      prisma.itemInventory.update.mockResolvedValue(inventoryResult);
      prisma.inventoryTransaction.create.mockResolvedValue(transactionResult);

      const result = await service.recordBake(1, 5, undefined, BAKERY_ID);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.itemInventory.update).toHaveBeenCalledWith({
        where: { itemId: 1 },
        data: { quantity: { decrement: 5 } },
      });
      expect(prisma.inventoryTransaction.create).toHaveBeenCalledWith({
        data: { itemId: 1, quantity: -5, reason: InventoryReason.BAKE },
      });
      expect(result).toEqual(transactionResult);
    });

    it('should include note in transaction when provided', async () => {
      const now = new Date();
      prisma.item.findFirst.mockResolvedValue({ id: 1, bakeryId: BAKERY_ID });
      prisma.itemInventory.findUnique.mockResolvedValue({ itemId: 1, quantity: 10 });
      prisma.itemInventory.update.mockResolvedValue({ itemId: 1, quantity: 5, updatedAt: now });
      prisma.inventoryTransaction.create.mockResolvedValue({
        id: 1, itemId: 1, quantity: -5, reason: InventoryReason.BAKE, note: 'Morning bake', createdAt: now,
      });

      await service.recordBake(1, 5, 'Morning bake', BAKERY_ID);

      expect(prisma.inventoryTransaction.create).toHaveBeenCalledWith({
        data: { itemId: 1, quantity: -5, reason: InventoryReason.BAKE, note: 'Morning bake' },
      });
    });
  });
});
