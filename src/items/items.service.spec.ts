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
      (prisma.items.findMany as jest.Mock).mockResolvedValue(mockItems);
      const result = await service.findAll();
      expect(result).toEqual(mockItems);
    });

    it('should return empty array if no items found', async () => {
      (prisma.items.findMany as jest.Mock).mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });

    it('should throw an error if prisma fails', async () => {
      const error = new Error('Database error');
      (prisma.items.findMany as jest.Mock).mockRejectedValue(error);
      await expect(service.findAll()).rejects.toThrow('Database error');
    });
  });

  describe('findOne', () => {
    it('should return an item if found', async () => {
      const mockItem = { id: '1', name: 'Item 1' };
      (prisma.items.findUnique as jest.Mock).mockResolvedValue(mockItem);
      const result = await service.findOne('1');
      expect(result).toEqual(mockItem);
    });

    it('should throw NotFoundException if item not found', async () => {
      (prisma.items.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return an item', async () => {
      const dto: CreateItemDto = { name: 'New Item' };
      const mockItem = { id: '2', name: 'New Item' };
      (prisma.items.create as jest.Mock).mockResolvedValue(mockItem);
      const result = await service.create(dto);
      expect(result).toEqual(mockItem);
      expect(prisma.items.create).toHaveBeenCalledWith({ data: { name: dto.name } });
    });
  });

  describe('update', () => {
    it('should update and return the item', async () => {
      const dto: UpdateItemDto = { id: '1', name: 'Updated Item' };
      const mockItem = { id: '1', name: 'Updated Item' };
      (prisma.items.update as jest.Mock).mockResolvedValue(mockItem);
      const result = await service.update('1', dto);
      expect(result).toEqual(mockItem);
      expect(prisma.items.update).toHaveBeenCalledWith({ where: { id: '1' }, data: { name: dto.name } });
    });

    it('should throw NotFoundException if item not found', async () => {
      (prisma.items.update as jest.Mock).mockRejectedValue(new Error());
      await expect(service.update('1', { id: '1', name: 'Updated Item' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete and return the item', async () => {
      const mockItem = { id: '1', name: 'Deleted Item' };
      (prisma.items.delete as jest.Mock).mockResolvedValue(mockItem);
      const result = await service.remove('1');
      expect(result).toEqual(mockItem);
      expect(prisma.items.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw NotFoundException if item not found', async () => {
      (prisma.items.delete as jest.Mock).mockRejectedValue(new Error());
      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });
});
