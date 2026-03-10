import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  ParseIntPipe,
  ParseEnumPipe,
} from '@nestjs/common';
import { Weekday } from '@prisma/client';
import { ProductionScheduleService } from './production_schedule.service';
import { CreateProductionScheduleDto } from './dto/create-production_schedule.dto';
import { UpdateProductionScheduleDto } from './dto/update-production_schedule.dto';

@Controller('production-schedule')
export class ProductionScheduleController {
  constructor(
    private readonly productionScheduleService: ProductionScheduleService,
  ) {}

  // GET /production-schedule — all entries for the authenticated bakery
  @Get()
  findAll(@Req() req: any) {
    return this.productionScheduleService.findAll(req.user.bakeryId);
  }

  // GET /production-schedule/item/:itemId — all weekdays for one item
  @Get('item/:itemId')
  findByItem(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Req() req: any,
  ) {
    return this.productionScheduleService.findByItem(itemId, req.user.bakeryId);
  }

  // POST /production-schedule — upsert an entry (create or update)
  @Post()
  upsert(@Body() dto: CreateProductionScheduleDto, @Req() req: any) {
    return this.productionScheduleService.upsert(dto, req.user.bakeryId);
  }

  // PATCH /production-schedule/:itemId/:weekday — update quantity of an existing entry
  @Patch(':itemId/:weekday')
  update(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Param('weekday', new ParseEnumPipe(Weekday)) weekday: Weekday,
    @Body() dto: UpdateProductionScheduleDto,
    @Req() req: any,
  ) {
    return this.productionScheduleService.update(itemId, weekday, dto, req.user.bakeryId);
  }

  // DELETE /production-schedule/:itemId/:weekday
  @Delete(':itemId/:weekday')
  remove(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Param('weekday', new ParseEnumPipe(Weekday)) weekday: Weekday,
    @Req() req: any,
  ) {
    return this.productionScheduleService.remove(itemId, weekday, req.user.bakeryId);
  }
}
