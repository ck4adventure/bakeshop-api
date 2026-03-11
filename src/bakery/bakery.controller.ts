import { Controller, Get, Patch, Body, Req, UseGuards } from '@nestjs/common';
import { BakeryService } from './bakery.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role, Weekday } from '@prisma/client';

@Controller('bakery')
export class BakeryController {
  constructor(private readonly bakeryService: BakeryService) {}

  @Get('settings')
  getSettings(@Req() req: any) {
    return this.bakeryService.getSettings(req.user.bakeryId);
  }

  @Patch('settings')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  updateSettings(
    @Body() body: { operatingDays: Weekday[] },
    @Req() req: any,
  ) {
    return this.bakeryService.updateOperatingDays(req.user.bakeryId, body.operatingDays);
  }
}
