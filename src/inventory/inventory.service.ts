import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async findAll(bakeryId: string) {
    return this.prisma.itemInventory.findMany({
      where: { item: { bakeryId } },
      include: {
        item: {
          select: { name: true, slug: true },
        },
      },
    });
  }
}
