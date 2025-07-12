import { Injectable } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { PrismaClient, item } from '@prisma/client';


@Injectable()
export class ItemService {
	private prisma = new PrismaClient();

  create(createItemDto: CreateItemDto) {
    return 'This action adds a new item';
  }

	findAll(): Promise<item[]> {
  return this.prisma.item.findMany();
}

  findOne(id: number) {
    return `This action returns a #${id} item`;
  }

  update(id: number, updateItemDto: UpdateItemDto) {
    return `This action updates a #${id} item`;
  }

  remove(id: number) {
    return `This action removes a #${id} item`;
  }
}
