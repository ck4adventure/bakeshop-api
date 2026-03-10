/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { PrismaService } from '../prisma/prisma.service';

const BAKERY_ID = 'bakery-uuid-1';

describe('InventoryService', () => {
  let service: InventoryService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: PrismaService,
          useValue: {
            itemInventory: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return inventory scoped to the bakery', async () => {
      const now = new Date();
      const mockInventory = [{ itemId: 1, quantity: 10, updatedAt: now, item: { name: 'Item 1', slug: 'item-1' } }];
      jest.spyOn(prisma.itemInventory, 'findMany').mockResolvedValue(mockInventory);

      const result = await service.findAll(BAKERY_ID);
      expect(result).toEqual(mockInventory);
      expect(prisma.itemInventory.findMany).toHaveBeenCalledWith({
        where: { item: { bakeryId: BAKERY_ID } },
        include: { item: { select: { name: true, slug: true } } },
      });
    });

    it('should return empty array if no inventory found', async () => {
      jest.spyOn(prisma.itemInventory, 'findMany').mockResolvedValue([]);
      const result = await service.findAll(BAKERY_ID);
      expect(result).toEqual([]);
    });

    it('should throw an error if prisma fails', async () => {
      jest.spyOn(prisma.itemInventory, 'findMany').mockRejectedValue(new Error('Database error'));
      await expect(service.findAll(BAKERY_ID)).rejects.toThrow('Database error');
    });
  });
});
