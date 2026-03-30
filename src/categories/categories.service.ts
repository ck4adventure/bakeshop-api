import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(bakeryId: string): Promise<Category[]> {
    return this.prisma.category.findMany({ where: { bakeryId }, orderBy: { name: 'asc' } });
  }

  async create(dto: CreateCategoryDto, bakeryId: string): Promise<Category> {
    const existing = await this.prisma.category.findUnique({
      where: { name_bakeryId: { name: dto.name, bakeryId } },
    });
    if (existing) {
      throw new ConflictException(`Category "${dto.name}" already exists`);
    }
    return this.prisma.category.create({ data: { name: dto.name, bakeryId } });
  }
}
