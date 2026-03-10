// batches.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryReason } from '@prisma/client';
import { CreateBatchDto } from './dto/create-batch.dto';

@Injectable()
export class BatchesService {
  constructor(private prisma: PrismaService) {}

  async createBatch(batchInfo: CreateBatchDto, bakeryId: string) {
    const itemId = batchInfo.itemId;
    const quantity = batchInfo.quantity;

    // 0. validate incoming data
    if (!Number.isInteger(itemId) || itemId <= 0) {
      throw new BadRequestException('Invalid itemId');
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new BadRequestException('Quantity must be a positive integer');
    }

    // Verify item exists and belongs to this bakery
    const itemExists = await this.prisma.item.findFirst({
      where: { id: itemId, bakeryId },
    });
    if (!itemExists) {
      throw new NotFoundException(`Item with id ${itemId} not found`);
    }

    // Atomically update inventory and log the transaction
    const [, transaction] = await this.prisma.$transaction([
      this.prisma.itemInventory.upsert({
        where: { itemId },
        update: { quantity: { increment: quantity } },
        create: { itemId, quantity },
      }),
      this.prisma.inventoryTransaction.create({
        data: { itemId, quantity, reason: InventoryReason.BATCH },
      }),
    ]);

    return transaction;
  }
}
