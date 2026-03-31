import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryReason } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async findAll(bakeryId: string) {
    const items = await this.prisma.item.findMany({
      where: { bakeryId },
      include: { inventory: true, category: true },
    });

    return items.map(item => ({
      itemId: item.id,
      quantity: item.inventory?.quantity ?? 0,
      item: {
        name: item.name,
        slug: item.slug,
        par: item.par,
        defaultBatchQty: item.defaultBatchQty,
        category: item.category ? { id: item.category.id, name: item.category.name } : null,
      },
    }));
  }

  async findAdjustments(bakeryId: string) {
    return this.prisma.inventoryTransaction.findMany({
      where: {
        reason: InventoryReason.ADJUSTMENT,
        product: { bakeryId },
      },
      include: {
        product: {
          select: { name: true, slug: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async recordAdjustment(itemId: number, quantity: number, note: string, bakeryId: string) {
    if (!Number.isInteger(itemId) || itemId <= 0) {
      throw new BadRequestException('Invalid itemId');
    }
    if (!Number.isInteger(quantity) || quantity === 0) {
      throw new BadRequestException('Quantity must be a non-zero integer');
    }
    if (!note?.trim()) {
      throw new BadRequestException('A note is required for manual adjustments');
    }

    const item = await this.prisma.item.findFirst({ where: { id: itemId, bakeryId } });
    if (!item) throw new NotFoundException(`Item with id ${itemId} not found`);

    return this.prisma.$transaction(async (tx) => {
      if (quantity < 0) {
        // Pre-check for a user-friendly error message; the trigger enforces this
        // atomically as the true guard against concurrent writes.
        const inv = await tx.itemInventory.findUnique({ where: { itemId } });
        const currentQty = inv?.quantity ?? 0;
        if (currentQty + quantity < 0) {
          throw new BadRequestException(
            `Adjustment would put stock at ${currentQty + quantity}. Current stock is ${currentQty}.`,
          );
        }
      }

      // Inserting the transaction is the only write needed — the trigger projects
      // the delta onto ItemInventory.
      return tx.inventoryTransaction.create({
        data: {
          itemId,
          quantity,
          reason: InventoryReason.ADJUSTMENT,
          note: note.trim(),
        },
      });
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

    return this.prisma.$transaction(async (tx) => {
      // Pre-check for a user-friendly error message; the trigger enforces this
      // atomically as the true guard against concurrent writes.
      const inv = await tx.itemInventory.findUnique({ where: { itemId } });
      const currentQty = inv?.quantity ?? 0;
      if (currentQty < quantity) {
        throw new BadRequestException(
          `Cannot bake ${quantity} — only ${currentQty} in stock. Use an adjustment if counts are off.`,
        );
      }

      // Inserting the transaction is the only write needed — the trigger projects
      // the delta onto ItemInventory.
      return tx.inventoryTransaction.create({
        data: {
          itemId,
          quantity: -quantity,
          reason: InventoryReason.BAKE,
          ...(note?.trim() && { note: note.trim() }),
        },
      });
    });
  }

  async findTodayBakes(bakeryId: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return this.prisma.inventoryTransaction.findMany({
      where: {
        reason: InventoryReason.BAKE,
        product: { bakeryId },
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
    });
  }

  async undoBake(transactionId: number, bakeryId: string) {
    const transaction = await this.prisma.inventoryTransaction.findFirst({
      where: { id: transactionId, reason: InventoryReason.BAKE, product: { bakeryId } },
    });
    if (!transaction) {
      throw new NotFoundException('Bake transaction not found');
    }

    // Deleting the transaction fires the trigger's DELETE handler, which
    // reverses the inventory delta without a separate explicit write.
    await this.prisma.inventoryTransaction.delete({ where: { id: transactionId } });
  }
}
