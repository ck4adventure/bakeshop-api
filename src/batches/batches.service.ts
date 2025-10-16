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

  async createBatch(batchInfo: CreateBatchDto) {
    const itemId = batchInfo.itemId;
    const quantity = batchInfo.quantity;

    // 0. validate incoming data
    if (!Number.isInteger(itemId) || itemId <= 0) {
      throw new BadRequestException('Invalid itemId');
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new BadRequestException('Quantity must be a positive integer');
    }

    // Optionally check item existence
    const itemExists = await this.prisma.item.findUnique({
      where: { id: itemId },
    });
    if (!itemExists) {
      throw new NotFoundException(`Item with id ${itemId} not found`);
    }

    // 1. Update inventory
    // const inventory = await this.prisma.itemInventory.upsert({
    //   where: { itemId },
    //   update: { quantity: { increment: quantity } },
    //   create: { itemId, quantity },
    // });

    // 2. Log transaction
    const result = await this.prisma.inventoryTransaction.create({
      data: {
        itemId,
        quantity: quantity,
        reason: InventoryReason.BATCH,
      },
    });

    return result;
  }
}
