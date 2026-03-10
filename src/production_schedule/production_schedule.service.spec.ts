import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Weekday } from '@prisma/client';
import { ProductionScheduleService } from './production_schedule.service';
import { PrismaService } from '../prisma/prisma.service';

const BAKERY_ID = 'bakery-1';
const ITEM_ID = 1;

const mockPrisma = {
  productionSchedule: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  item: {
    findFirst: jest.fn(),
  },
};

describe('ProductionScheduleService', () => {
  let service: ProductionScheduleService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductionScheduleService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ProductionScheduleService>(ProductionScheduleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('returns all schedule entries for the bakery', async () => {
      const entries = [{ itemId: ITEM_ID, weekday: Weekday.Monday, quantity: 12 }];
      mockPrisma.productionSchedule.findMany.mockResolvedValue(entries);
      const result = await service.findAll(BAKERY_ID);
      expect(result).toEqual(entries);
      expect(mockPrisma.productionSchedule.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { item: { bakeryId: BAKERY_ID } } }),
      );
    });
  });

  describe('findByItem', () => {
    it('throws NotFoundException when item does not belong to bakery', async () => {
      mockPrisma.item.findFirst.mockResolvedValue(null);
      await expect(service.findByItem(ITEM_ID, BAKERY_ID)).rejects.toThrow(NotFoundException);
    });

    it('returns all weekday entries for the item', async () => {
      mockPrisma.item.findFirst.mockResolvedValue({ id: ITEM_ID });
      const entries = [{ itemId: ITEM_ID, weekday: Weekday.Monday, quantity: 12 }];
      mockPrisma.productionSchedule.findMany.mockResolvedValue(entries);
      const result = await service.findByItem(ITEM_ID, BAKERY_ID);
      expect(result).toEqual(entries);
    });
  });

  describe('upsert', () => {
    it('throws NotFoundException when item does not belong to bakery', async () => {
      mockPrisma.item.findFirst.mockResolvedValue(null);
      await expect(
        service.upsert({ itemId: ITEM_ID, weekday: Weekday.Monday, quantity: 10 }, BAKERY_ID),
      ).rejects.toThrow(NotFoundException);
    });

    it('upserts the schedule entry', async () => {
      mockPrisma.item.findFirst.mockResolvedValue({ id: ITEM_ID });
      const entry = { itemId: ITEM_ID, weekday: Weekday.Monday, quantity: 10 };
      mockPrisma.productionSchedule.upsert.mockResolvedValue(entry);
      const result = await service.upsert(entry, BAKERY_ID);
      expect(result).toEqual(entry);
    });
  });

  describe('update', () => {
    it('throws NotFoundException when entry does not exist', async () => {
      mockPrisma.productionSchedule.findFirst.mockResolvedValue(null);
      await expect(
        service.update(ITEM_ID, Weekday.Monday, { quantity: 5 }, BAKERY_ID),
      ).rejects.toThrow(NotFoundException);
    });

    it('updates the entry quantity', async () => {
      const existing = { itemId: ITEM_ID, weekday: Weekday.Monday, quantity: 10 };
      mockPrisma.productionSchedule.findFirst.mockResolvedValue(existing);
      mockPrisma.productionSchedule.update.mockResolvedValue({ ...existing, quantity: 5 });
      const result = await service.update(ITEM_ID, Weekday.Monday, { quantity: 5 }, BAKERY_ID);
      expect(result.quantity).toBe(5);
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when entry does not exist', async () => {
      mockPrisma.productionSchedule.findFirst.mockResolvedValue(null);
      await expect(service.remove(ITEM_ID, Weekday.Monday, BAKERY_ID)).rejects.toThrow(NotFoundException);
    });

    it('deletes the entry', async () => {
      const existing = { itemId: ITEM_ID, weekday: Weekday.Monday, quantity: 10 };
      mockPrisma.productionSchedule.findFirst.mockResolvedValue(existing);
      mockPrisma.productionSchedule.delete.mockResolvedValue(existing);
      const result = await service.remove(ITEM_ID, Weekday.Monday, BAKERY_ID);
      expect(result).toEqual(existing);
    });
  });
});
