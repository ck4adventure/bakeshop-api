import { Controller, Get, Post, Delete, Body, Param, Req } from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.inventoryService.findAll(req.user.bakeryId);
  }

  @Get('adjustments')
  findAdjustments(@Req() req: any) {
    return this.inventoryService.findAdjustments(req.user.bakeryId);
  }

  @Post('adjust')
  recordAdjustment(
    @Body() body: { itemId: number; quantity: number; note: string },
    @Req() req: any,
  ) {
    return this.inventoryService.recordAdjustment(body.itemId, body.quantity, body.note, req.user.bakeryId);
  }

  @Get('bakes/today')
  findTodayBakes(@Req() req: any) {
    return this.inventoryService.findTodayBakes(req.user.bakeryId);
  }

  @Post('bake')
  recordBake(
    @Body() body: { itemId: number; quantity: number; note?: string },
    @Req() req: any,
  ) {
    return this.inventoryService.recordBake(body.itemId, body.quantity, body.note, req.user.bakeryId);
  }

  @Delete('bake/:id')
  undoBake(@Param('id') id: string, @Req() req: any) {
    return this.inventoryService.undoBake(Number(id), req.user.bakeryId);
  }
}
