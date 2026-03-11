/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from '@nestjs/testing';
import { ItemsService } from './items.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

const BAKERY_ID = 'bakery-uuid-1';

describe('ItemsService', () => {
  let service: ItemsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemsService,
        {
          provide: PrismaService,
          useValue: {
            item: {
              create: jest.fn(),
              findMany: jest.fn(),
              findFirst: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ItemsService>(ItemsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return items for the bakery', async () => {
      const now = new Date();
      const mockItems = [{ id: 1, name: 'Item 1', slug: 'item-1', bakeryId: BAKERY_ID, par: null, defaultBatchQty: null, createdAt: now, updatedAt: now }];
      jest.spyOn(prisma.item, 'findMany').mockResolvedValue(mockItems);

      const result = await service.findAll(BAKERY_ID);
      expect(result).toEqual(mockItems);
      expect(prisma.item.findMany).toHaveBeenCalledWith({ where: { bakeryId: BAKERY_ID } });
    });

    it('should return empty array if no items found', async () => {
      jest.spyOn(prisma.item, 'findMany').mockResolvedValue([]);
      const result = await service.findAll(BAKERY_ID);
      expect(result).toEqual([]);
    });

    it('should throw an error if prisma fails', async () => {
      jest.spyOn(prisma.item, 'findMany').mockRejectedValue(new Error('Database error'));
      await expect(service.findAll(BAKERY_ID)).rejects.toThrow('Database error');
    });
  });

  describe('findOne', () => {
    it('should return an item if found', async () => {
      const now = new Date();
      const mockItem = { id: 1, name: 'Item 1', slug: 'item-1', bakeryId: BAKERY_ID, par: null, defaultBatchQty: null, createdAt: now, updatedAt: now };
      jest.spyOn(prisma.item, 'findFirst').mockResolvedValue(mockItem);

      const result = await service.findOne('item-1', BAKERY_ID);
      expect(result).toEqual(mockItem);
      expect(prisma.item.findFirst).toHaveBeenCalledWith({
        where: { slug: 'item-1', bakeryId: BAKERY_ID },
        include: { inventory: true },
      });
    });

    it('should throw NotFoundException if item not found', async () => {
      jest.spyOn(prisma.item, 'findFirst').mockResolvedValue(null);
      await expect(service.findOne('missing', BAKERY_ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return an item scoped to the bakery', async () => {
      const now = new Date();
      const dto: CreateItemDto = { name: 'New Item' };
      const mockItem = { id: 2, name: 'New Item', slug: 'new-item', bakeryId: BAKERY_ID, par: null, defaultBatchQty: null, createdAt: now, updatedAt: now };
      jest.spyOn(prisma.item, 'create').mockResolvedValue(mockItem);

      const result = await service.create(dto, BAKERY_ID);
      expect(result).toEqual(mockItem);
      expect(prisma.item.create).toHaveBeenCalledWith({
        data: { name: dto.name, slug: 'new-item', bakeryId: BAKERY_ID },
      });
    });
  });

  describe('update', () => {
    it('should update and return the item', async () => {
      const now = new Date();
      const dto: UpdateItemDto = { id: '1', name: 'Updated Item' };
      const existing = { id: 1, name: 'Item 1', slug: 'item-1', bakeryId: BAKERY_ID, par: null, defaultBatchQty: null, createdAt: now, updatedAt: now };
      const updated = { ...existing, name: 'Updated Item', slug: 'updated-item' };

      jest.spyOn(prisma.item, 'findFirst').mockResolvedValue(existing);
      jest.spyOn(prisma.item, 'update').mockResolvedValue(updated);

      const result = await service.update('item-1', dto, BAKERY_ID);
      expect(result).toEqual(updated);
      expect(prisma.item.findFirst).toHaveBeenCalledWith({ where: { slug: 'item-1', bakeryId: BAKERY_ID } });
      expect(prisma.item.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: dto.name, slug: 'updated-item' },
      });
    });

    it('should throw NotFoundException if item not found', async () => {
      jest.spyOn(prisma.item, 'findFirst').mockResolvedValue(null);
      await expect(service.update('missing', { id: '1', name: 'x' }, BAKERY_ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete and return the item', async () => {
      const now = new Date();
      const existing = { id: 1, name: 'Item 1', slug: 'item-1', bakeryId: BAKERY_ID, par: null, defaultBatchQty: null, createdAt: now, updatedAt: now };
      jest.spyOn(prisma.item, 'findFirst').mockResolvedValue(existing);
      jest.spyOn(prisma.item, 'delete').mockResolvedValue(existing);

      const result = await service.remove('1', BAKERY_ID);
      expect(result).toEqual(existing);
      expect(prisma.item.findFirst).toHaveBeenCalledWith({ where: { id: 1, bakeryId: BAKERY_ID } });
      expect(prisma.item.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if item not found', async () => {
      jest.spyOn(prisma.item, 'findFirst').mockResolvedValue(null);
      await expect(service.remove('1', BAKERY_ID)).rejects.toThrow(NotFoundException);
    });
  });
});
