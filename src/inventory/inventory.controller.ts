import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.inventoryService.findAll(req.user.bakeryId);
  }

  @Post('adjust')
  recordAdjustment(
    @Body() body: { itemId: number; quantity: number; note: string },
    @Req() req: any,
  ) {
    return this.inventoryService.recordAdjustment(body.itemId, body.quantity, body.note, req.user.bakeryId);
  }

  @Post('bake')
  recordBake(
    @Body() body: { itemId: number; quantity: number; note?: string },
    @Req() req: any,
  ) {
    return this.inventoryService.recordBake(body.itemId, body.quantity, body.note, req.user.bakeryId);
  }
}
