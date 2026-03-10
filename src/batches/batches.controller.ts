// batches.controller.ts
import { Controller, Post, Body, Req } from '@nestjs/common';
import { BatchesService } from './batches.service';

@Controller('batches')
export class BatchesController {
  constructor(private batchesService: BatchesService) {}

  @Post()
  async createBatch(@Body() body: { itemId: number; quantity: number }, @Req() req: any) {
    return this.batchesService.createBatch(body, req.user.bakeryId);
  }
}
