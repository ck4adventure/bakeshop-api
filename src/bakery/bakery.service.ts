import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Weekday } from '@prisma/client';

@Injectable()
export class BakeryService {
  constructor(private prisma: PrismaService) {}

  async getSettings(bakeryId: string) {
    const bakery = await this.prisma.bakery.findUnique({
      where: { id: bakeryId },
      select: { id: true, name: true, slug: true, operatingDays: true },
    });
    if (!bakery) throw new NotFoundException('Bakery not found');
    return bakery;
  }

  async updateOperatingDays(bakeryId: string, operatingDays: Weekday[]) {
    const bakery = await this.prisma.bakery.findUnique({ where: { id: bakeryId } });
    if (!bakery) throw new NotFoundException('Bakery not found');
    return this.prisma.bakery.update({
      where: { id: bakeryId },
      data: { operatingDays },
      select: { id: true, name: true, slug: true, operatingDays: true },
    });
  }
}
