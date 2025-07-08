import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemsService {
  private prisma = new PrismaClient();

  // async create(createItemDto: CreateItemDto) {
  //   return this.prisma.item.create({ data: createItemDto });
  // }

	async findAll(params?: { skip?: number; take?: number; where?: any; orderBy?: any }) {
		try {
			// const { skip, take, where, orderBy } = params || {};
			return await this.prisma.item.findMany();
		} catch (error) {
			// Optionally, log the error or handle it as needed
			console.error(`Failed to fetch items: ${error.message}`)
			throw new Error(`Failed to fetch items: ${error.message}`);
		}
	}

  // async findOne(id: string) {
  //   return this.prisma.item.findUnique({ where: { id } });
  // }

  // async update(id: string, updateItemDto: UpdateItemDto) {
  //   return this.prisma.item.update({
  //     where: { id },
  //     data: updateItemDto,
  //   });
  // }

  // async remove(id: string) {
  //   return this.prisma.item.delete({ where: { id } });
  // }
}
