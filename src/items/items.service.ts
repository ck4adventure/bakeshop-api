import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { Items } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ItemsService {
  constructor(private prisma: PrismaService) {}

  async create(createItemDto: CreateItemDto): Promise<Items> {
    return this.prisma.items.create({
      data: {
        name: createItemDto.name,
      },
    });
  }

  async findAll(): Promise<Items[]> {
    return this.prisma.items.findMany();
  }

  async findOne(id: string): Promise<Items> {
    const item = await this.prisma.items.findUnique({
      where: { id },
    });
    if (!item) {
      throw new NotFoundException(`Item with id ${id} not found`);
    }
    return item;
  }

  async update(id: string, updateItemDto: UpdateItemDto): Promise<Items> {
    try {
      return await this.prisma.items.update({
        where: { id },
        data: {
          name: updateItemDto.name,
        },
      });
    } catch (err) {
      throw new NotFoundException(`Item with id ${id} not found`);
    }
  }

  async remove(id: string): Promise<Items> {
    try {
      return await this.prisma.items.delete({
        where: { id },
      });
    } catch (err) {
      throw new NotFoundException(`Item with id ${id} not found`);
    }
  }
}
