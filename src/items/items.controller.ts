import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemService: ItemsService) {}

  @Post()
  create(@Body() createItemDto: CreateItemDto, @Req() req: any) {
    return this.itemService.create(createItemDto, req.user.bakeryId);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.itemService.findAll(req.user.bakeryId);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string, @Req() req: any) {
    return this.itemService.findOne(slug, req.user.bakeryId);
  }

  @Patch(':slug')
  update(@Param('slug') slug: string, @Body() updateItemDto: UpdateItemDto, @Req() req: any) {
    return this.itemService.update(slug, updateItemDto, req.user.bakeryId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.itemService.remove(id, req.user.bakeryId);
  }
}
