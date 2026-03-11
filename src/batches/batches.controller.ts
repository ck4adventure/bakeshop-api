// batches.controller.ts
import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { BatchesService } from './batches.service';

@Controller('batches')
export class BatchesController {
  constructor(private batchesService: BatchesService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.batchesService.findAll(req.user.bakeryId);
  }

  @Post()
  async createBatch(@Body() body: { itemId: number; quantity: number }, @Req() req: any) {
    return this.batchesService.createBatch(body, req.user.bakeryId);
  }
}
