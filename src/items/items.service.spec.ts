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
            items: {
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
      const mockItems = [{ id: '1', name: 'Item 1' }];
      jest.spyOn(prisma.items, 'findMany').mockResolvedValue(mockItems);

      const result = await service.findAll();
      expect(result).toEqual(mockItems);
      expect(prisma.items.findMany).toHaveBeenCalled();
    });

    it('should return empty array if no items found', async () => {
      jest.spyOn(prisma.items, 'findMany').mockResolvedValue([]);

      const result = await service.findAll();
      expect(result).toEqual([]);
    });

    it('should throw an error if prisma fails', async () => {
      jest
        .spyOn(prisma.items, 'findMany')
        .mockRejectedValue(new Error('Database error'));

      await expect(service.findAll()).rejects.toThrow('Database error');
    });
  });

  describe('findOne', () => {
    it('should return an item if found', async () => {
      const mockItem = { id: '1', name: 'Item 1' };
      jest.spyOn(prisma.items, 'findUnique').mockResolvedValue(mockItem);

      const result = await service.findOne('1');
      expect(result).toEqual(mockItem);
      expect(prisma.items.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException if item not found', async () => {
      jest.spyOn(prisma.items, 'findUnique').mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return an item', async () => {
      const dto: CreateItemDto = { name: 'New Item' };
      const mockItem = { id: '2', name: 'New Item' };
      jest.spyOn(prisma.items, 'create').mockResolvedValue(mockItem);

      const result = await service.create(dto);
      expect(result).toEqual(mockItem);
      expect(prisma.items.create).toHaveBeenCalledWith({
        data: { name: dto.name },
      });
    });
  });

  describe('update', () => {
    it('should update and return the item', async () => {
      const dto: UpdateItemDto = { id: '1', name: 'Updated Item' };
      const mockItem = { id: '1', name: 'Updated Item' };
      jest.spyOn(prisma.items, 'update').mockResolvedValue(mockItem);

      const result = await service.update('1', dto);
      expect(result).toEqual(mockItem);
      expect(prisma.items.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { name: dto.name },
      });
    });

    it('should throw NotFoundException if item not found', async () => {
      jest
        .spyOn(prisma.items, 'update')
        .mockRejectedValue(new Error('Record not found'));

      await expect(
        service.update('1', { id: '1', name: 'Updated Item' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete and return the item', async () => {
      const mockItem = { id: '1', name: 'Deleted Item' };
      jest.spyOn(prisma.items, 'delete').mockResolvedValue(mockItem);

      const result = await service.remove('1');
      expect(result).toEqual(mockItem);
      expect(prisma.items.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException if item not found', async () => {
      jest
        .spyOn(prisma.items, 'delete')
        .mockRejectedValue(new Error('Record not found'));

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });
});
