import { Controller, Get, Req } from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.inventoryService.findAll(req.user.bakeryId);
  }
}
