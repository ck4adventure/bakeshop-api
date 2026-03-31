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
    item: { findFirst: jest.Mock; findMany: jest.Mock };
    itemInventory: { findUnique: jest.Mock };
    inventoryTransaction: { create: jest.Mock; findMany: jest.Mock; findFirst: jest.Mock; delete: jest.Mock };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      item: { findFirst: jest.fn(), findMany: jest.fn() },
      itemInventory: { findUnique: jest.fn() },
      inventoryTransaction: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        delete: jest.fn(),
      },
      // Handles both the array form ($transaction([op1, op2])) and the
      // interactive/callback form ($transaction(async tx => { ... })).
      $transaction: jest.fn().mockImplementation(
        (opsOrFn: unknown[] | ((tx: unknown) => Promise<unknown>)) => {
          if (typeof opsOrFn === 'function') {
            return opsOrFn(prisma);
          }
          return Promise.all(opsOrFn as Promise<unknown>[]);
        },
      ),
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
    it('should return inventory scoped to the bakery, mapping item.inventory.quantity', async () => {
      prisma.item.findMany.mockResolvedValue([
        {
          id: 1,
          name: 'Item 1',
          slug: 'item-1',
          par: null,
          defaultBatchQty: null,
          bakeryId: BAKERY_ID,
          inventory: { itemId: 1, quantity: 10 },
          category: null,
        },
      ]);

      const result = await service.findAll(BAKERY_ID);

      expect(prisma.item.findMany).toHaveBeenCalledWith({
        where: { bakeryId: BAKERY_ID },
        include: { inventory: true, category: true },
      });
      expect(result).toEqual([
        { itemId: 1, quantity: 10, item: { name: 'Item 1', slug: 'item-1', par: null, defaultBatchQty: null, category: null } },
      ]);
    });

    it('returns quantity 0 when an item has no inventory record yet', async () => {
      prisma.item.findMany.mockResolvedValue([
        { id: 2, name: 'New Item', slug: 'new-item', par: null, defaultBatchQty: null, bakeryId: BAKERY_ID, inventory: null, category: null },
      ]);

      const result = await service.findAll(BAKERY_ID);
      expect(result[0].quantity).toBe(0);
    });

    it('should return empty array if bakery has no items', async () => {
      prisma.item.findMany.mockResolvedValue([]);
      const result = await service.findAll(BAKERY_ID);
      expect(result).toEqual([]);
    });

    it('should propagate errors from prisma', async () => {
      prisma.item.findMany.mockRejectedValue(new Error('Database error'));
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

    it('should throw BadRequestException when negative delta would put stock below zero', async () => {
      prisma.item.findFirst.mockResolvedValue({ id: 1, bakeryId: BAKERY_ID });
      prisma.itemInventory.findUnique.mockResolvedValue({ itemId: 1, quantity: 3 });

      await expect(service.recordAdjustment(1, -5, 'Recount', BAKERY_ID)).rejects.toThrow(BadRequestException);
      expect(prisma.itemInventory.findUnique).toHaveBeenCalledWith({ where: { itemId: 1 } });
    });

    it('should create a transaction for a negative delta when stock is sufficient', async () => {
      const now = new Date();
      prisma.item.findFirst.mockResolvedValue({ id: 1, bakeryId: BAKERY_ID });
      prisma.itemInventory.findUnique.mockResolvedValue({ itemId: 1, quantity: 10 });
      const transactionResult = { id: 1, itemId: 1, quantity: -5, reason: InventoryReason.ADJUSTMENT, note: 'Recount', createdAt: now };
      prisma.inventoryTransaction.create.mockResolvedValue(transactionResult);

      const result = await service.recordAdjustment(1, -5, 'Recount', BAKERY_ID);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.inventoryTransaction.create).toHaveBeenCalledWith({
        data: { itemId: 1, quantity: -5, reason: InventoryReason.ADJUSTMENT, note: 'Recount' },
      });
      expect(result).toEqual(transactionResult);
    });

    it('should create a transaction for a positive delta without a pre-check read', async () => {
      const now = new Date();
      prisma.item.findFirst.mockResolvedValue({ id: 1, bakeryId: BAKERY_ID });
      const transactionResult = { id: 1, itemId: 1, quantity: 5, reason: InventoryReason.ADJUSTMENT, note: 'Recount', createdAt: now };
      prisma.inventoryTransaction.create.mockResolvedValue(transactionResult);

      const result = await service.recordAdjustment(1, 5, 'Recount', BAKERY_ID);

      expect(prisma.$transaction).toHaveBeenCalled();
      // No pre-check needed for positive delta — trigger handles the upsert
      expect(prisma.itemInventory.findUnique).not.toHaveBeenCalled();
      expect(prisma.inventoryTransaction.create).toHaveBeenCalledWith({
        data: { itemId: 1, quantity: 5, reason: InventoryReason.ADJUSTMENT, note: 'Recount' },
      });
      expect(result).toEqual(transactionResult);
    });

    it('should propagate errors from prisma', async () => {
      prisma.item.findFirst.mockResolvedValue({ id: 1, bakeryId: BAKERY_ID });
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

    it('should throw BadRequestException when bake quantity exceeds current stock', async () => {
      prisma.item.findFirst.mockResolvedValue({ id: 1, bakeryId: BAKERY_ID });
      prisma.itemInventory.findUnique.mockResolvedValue({ itemId: 1, quantity: 3 });

      await expect(service.recordBake(1, 5, undefined, BAKERY_ID)).rejects.toThrow(BadRequestException);
      expect(prisma.itemInventory.findUnique).toHaveBeenCalledWith({ where: { itemId: 1 } });
    });

    it('should create a transaction with negative quantity when stock is sufficient', async () => {
      const now = new Date();
      prisma.item.findFirst.mockResolvedValue({ id: 1, bakeryId: BAKERY_ID });
      prisma.itemInventory.findUnique.mockResolvedValue({ itemId: 1, quantity: 10 });
      const transactionResult = { id: 1, itemId: 1, quantity: -5, reason: InventoryReason.BAKE, note: null, createdAt: now };
      prisma.inventoryTransaction.create.mockResolvedValue(transactionResult);

      const result = await service.recordBake(1, 5, undefined, BAKERY_ID);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.inventoryTransaction.create).toHaveBeenCalledWith({
        data: { itemId: 1, quantity: -5, reason: InventoryReason.BAKE },
      });
      expect(result).toEqual(transactionResult);
    });

    it('should include note in transaction when provided', async () => {
      const now = new Date();
      prisma.item.findFirst.mockResolvedValue({ id: 1, bakeryId: BAKERY_ID });
      prisma.itemInventory.findUnique.mockResolvedValue({ itemId: 1, quantity: 10 });
      prisma.inventoryTransaction.create.mockResolvedValue({
        id: 1, itemId: 1, quantity: -5, reason: InventoryReason.BAKE, note: 'Morning bake', createdAt: now,
      });

      await service.recordBake(1, 5, 'Morning bake', BAKERY_ID);

      expect(prisma.inventoryTransaction.create).toHaveBeenCalledWith({
        data: { itemId: 1, quantity: -5, reason: InventoryReason.BAKE, note: 'Morning bake' },
      });
    });
  });

  describe('undoBake', () => {
    it('should throw NotFoundException if bake transaction does not exist', async () => {
      prisma.inventoryTransaction.findFirst.mockResolvedValue(null);
      await expect(service.undoBake(99, BAKERY_ID)).rejects.toThrow(NotFoundException);
    });

    it('should delete the transaction (trigger reverses the inventory delta)', async () => {
      prisma.inventoryTransaction.findFirst.mockResolvedValue({ id: 1, itemId: 1, quantity: -5 });
      prisma.inventoryTransaction.delete.mockResolvedValue({});

      await service.undoBake(1, BAKERY_ID);

      expect(prisma.inventoryTransaction.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});
