// batches.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { BatchesService } from './batches.service';

@Controller('batches')
export class BatchesController {
  constructor(private batchesService: BatchesService) {}

  @Post()
  async createBatch(@Body() body: { itemId: number; quantity: number }) {
    return this.batchesService.createBatch(body.itemId, body.quantity);
  }
}
