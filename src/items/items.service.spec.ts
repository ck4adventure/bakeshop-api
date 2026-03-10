/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from '@nestjs/testing';
import { ItemsService } from './items.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

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
    it('should return an array of items', async () => {
      const now = new Date();
      const mockItems = [
        {
          id: 1,
          name: 'Item 1',
          slug: 'item-1',
          createdAt: now,
          updatedAt: now,
        },
      ];
      jest.spyOn(prisma.item, 'findMany').mockResolvedValue(mockItems);

      const result = await service.findAll();
      expect(result).toEqual(mockItems);
      expect(prisma.item.findMany).toHaveBeenCalled();
    });

    it('should return empty array if no items found', async () => {
      jest.spyOn(prisma.item, 'findMany').mockResolvedValue([]);

      const result = await service.findAll();
      expect(result).toEqual([]);
    });

    it('should throw an error if prisma fails', async () => {
      jest
        .spyOn(prisma.item, 'findMany')
        .mockRejectedValue(new Error('Database error'));

      await expect(service.findAll()).rejects.toThrow('Database error');
    });
  });

  describe('findOne', () => {
    it('should return an item if found', async () => {
      const now = new Date();
      const mockItem = {
        id: 1,
        name: 'Item 1',
        slug: 'item-1',
        createdAt: now,
        updatedAt: now,
      };
      jest.spyOn(prisma.item, 'findUnique').mockResolvedValue(mockItem);

      const result = await service.findOne('1');
      expect(result).toEqual(mockItem);
      expect(prisma.item.findUnique).toHaveBeenCalledWith({
        where: { slug: '1' },
        include: { inventory: true },
      });
    });

    it('should throw NotFoundException if item not found', async () => {
      jest.spyOn(prisma.item, 'findUnique').mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return an item', async () => {
      const now = new Date();
      const dto: CreateItemDto = { name: 'New Item' };
      const mockItem = {
        id: 2,
        name: 'New Item',
        slug: 'new-item',
        createdAt: now,
        updatedAt: now,
      };
      jest.spyOn(prisma.item, 'create').mockResolvedValue(mockItem);

      const result = await service.create(dto);
      expect(result).toEqual(mockItem);
      expect(prisma.item.create).toHaveBeenCalledWith({
        data: { name: dto.name, slug: 'new-item' },
      });
    });
  });

  describe('update', () => {
    it('should update and return the item', async () => {
      const now = new Date();
      const dto: UpdateItemDto = { id: '1', name: 'Updated Item' };
      const mockItem = {
        id: 1,
        name: 'Updated Item',
        slug: 'updated-item',
        createdAt: now,
        updatedAt: now,
      };
      jest.spyOn(prisma.item, 'update').mockResolvedValue(mockItem);

      const result = await service.update('1', dto);
      expect(result).toEqual(mockItem);
      expect(prisma.item.update).toHaveBeenCalledWith({
        where: { slug: '1' },
        data: { name: dto.name, slug: 'updated-item' },
      });
    });

    it('should throw NotFoundException if item not found', async () => {
      jest
        .spyOn(prisma.item, 'update')
        .mockRejectedValue(new Error('Record not found'));

      await expect(
        service.update('1', { id: '1', name: 'Updated Item' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete and return the item', async () => {
      const now = new Date();
      const mockItem = {
        id: 1,
        name: 'Deleted Item',
        slug: 'deleted-item',
        createdAt: now,
        updatedAt: now,
      };
      jest.spyOn(prisma.item, 'delete').mockResolvedValue(mockItem);

      const result = await service.remove('1');
      expect(result).toEqual(mockItem);
      expect(prisma.item.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException if item not found', async () => {
      jest
        .spyOn(prisma.item, 'delete')
        .mockRejectedValue(new Error('Record not found'));

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });
});
