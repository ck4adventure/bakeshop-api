import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.categoriesService.findAll(req.user.bakeryId);
  }

  @Post()
  create(@Body() dto: CreateCategoryDto, @Req() req: any) {
    return this.categoriesService.create(dto, req.user.bakeryId);
  }
}
