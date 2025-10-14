function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { Item } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ItemsService {
  constructor(private prisma: PrismaService) {}

  async create(createItemDto: CreateItemDto): Promise<Item> {
    return this.prisma.item.create({
      data: {
        name: createItemDto.name,
        slug: slugify(createItemDto.name),
      },
    });
  }

  async findAll(): Promise<Item[]> {
    return this.prisma.item.findMany();
  }

  async findOne(id: string): Promise<Item> {
    const item = await this.prisma.item.findUnique({
      where: { id: Number(id) },
    });
    if (!item) {
      throw new NotFoundException(`Item with id ${id} not found`);
    }
    return item;
  }

  async update(id: string, updateItemDto: UpdateItemDto): Promise<Item> {
    try {
      return await this.prisma.item.update({
        where: { id: Number(id) },
        data: {
          name: updateItemDto.name,
          slug: slugify(updateItemDto.name ?? ''),
        },
      });
    } catch (err) {
      throw new NotFoundException(`Item with id ${id} not found`);
    }
  }

  async remove(id: string): Promise<Item> {
    try {
      return await this.prisma.item.delete({
        where: { id: Number(id) },
      });
    } catch (err) {
      throw new NotFoundException(`Item with id ${id} not found`);
    }
  }
}
