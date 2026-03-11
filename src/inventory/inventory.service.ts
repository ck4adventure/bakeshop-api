import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryReason } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async findAll(bakeryId: string) {
    return this.prisma.itemInventory.findMany({
      where: { item: { bakeryId } },
      include: {
        item: {
          select: { name: true, slug: true, par: true, defaultBatchQty: true },
        },
      },
    });
  }

  async recordBake(itemId: number, quantity: number, note: string | undefined, bakeryId: string) {
    if (!Number.isInteger(itemId) || itemId <= 0) {
      throw new BadRequestException('Invalid itemId');
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new BadRequestException('Quantity must be a positive integer');
    }

    const item = await this.prisma.item.findFirst({ where: { id: itemId, bakeryId } });
    if (!item) {
      throw new NotFoundException(`Item with id ${itemId} not found`);
    }

    const inventory = await this.prisma.itemInventory.findUnique({ where: { itemId } });
    const currentQty = inventory?.quantity ?? 0;
    if (quantity > currentQty) {
      throw new BadRequestException(
        `Cannot bake ${quantity} — only ${currentQty} in stock. Use an adjustment if counts are off.`,
      );
    }

    const [, transaction] = await this.prisma.$transaction([
      this.prisma.itemInventory.update({
        where: { itemId },
        data: { quantity: { decrement: quantity } },
      }),
      this.prisma.inventoryTransaction.create({
        data: {
          itemId,
          quantity: -quantity,
          reason: InventoryReason.BAKE,
          ...(note?.trim() && { note: note.trim() }),
        },
      }),
    ]);

    return transaction;
  }
}
