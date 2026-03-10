import { Injectable, NotFoundException } from '@nestjs/common';
import { Weekday } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductionScheduleDto } from './dto/create-production_schedule.dto';
import { UpdateProductionScheduleDto } from './dto/update-production_schedule.dto';

@Injectable()
export class ProductionScheduleService {
  constructor(private prisma: PrismaService) {}

  // All schedule entries for a bakery, ordered by item then weekday
  async findAll(bakeryId: string) {
    return this.prisma.productionSchedule.findMany({
      where: { item: { bakeryId } },
      include: { item: { select: { name: true, slug: true } } },
      orderBy: [{ itemId: 'asc' }, { weekday: 'asc' }],
    });
  }

  // All weekday entries for a single item
  async findByItem(itemId: number, bakeryId: string) {
    const item = await this.prisma.item.findFirst({ where: { id: itemId, bakeryId } });
    if (!item) throw new NotFoundException(`Item ${itemId} not found`);

    return this.prisma.productionSchedule.findMany({
      where: { itemId },
      orderBy: { weekday: 'asc' },
    });
  }

  // Upsert: creates the entry if it doesn't exist, updates quantity if it does
  async upsert(dto: CreateProductionScheduleDto, bakeryId: string) {
    const item = await this.prisma.item.findFirst({ where: { id: dto.itemId, bakeryId } });
    if (!item) throw new NotFoundException(`Item ${dto.itemId} not found`);

    return this.prisma.productionSchedule.upsert({
      where: { itemId_weekday: { itemId: dto.itemId, weekday: dto.weekday } },
      create: { itemId: dto.itemId, weekday: dto.weekday, quantity: dto.quantity },
      update: { quantity: dto.quantity },
    });
  }

  // Update just the quantity of an existing entry
  async update(itemId: number, weekday: Weekday, dto: UpdateProductionScheduleDto, bakeryId: string) {
    const existing = await this.prisma.productionSchedule.findFirst({
      where: { itemId, weekday, item: { bakeryId } },
    });
    if (!existing) throw new NotFoundException(`No schedule for item ${itemId} on ${weekday}`);

    return this.prisma.productionSchedule.update({
      where: { itemId_weekday: { itemId, weekday } },
      data: { quantity: dto.quantity },
    });
  }

  // Remove a single entry
  async remove(itemId: number, weekday: Weekday, bakeryId: string) {
    const existing = await this.prisma.productionSchedule.findFirst({
      where: { itemId, weekday, item: { bakeryId } },
    });
    if (!existing) throw new NotFoundException(`No schedule for item ${itemId} on ${weekday}`);

    return this.prisma.productionSchedule.delete({
      where: { itemId_weekday: { itemId, weekday } },
    });
  }
}
