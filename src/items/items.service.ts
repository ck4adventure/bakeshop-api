function slugify(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)+/g, '');
}
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { Item, ItemInventory } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ItemsService {
	constructor(private prisma: PrismaService) { }

	async create(createItemDto: CreateItemDto): Promise<Item> {
		return this.prisma.item.create({
			data: {
				name: createItemDto.name,
				slug: slugify(createItemDto.name),
			},
		});
	}

	async findAll(): Promise<Item[]> {
		return this.prisma.item.findMany();
	}

	async findOne(slug: string): Promise<Item> {
		// const item = await this.prisma.itemInventory.findUnique({
		//   where: { itemId: Number(id) },
		// 	include: { item: true }
		// });
		// if (!item) {
		//   throw new NotFoundException(`Item with id ${id} not found`);
		// }

		const item = await this.prisma.item.findUnique({
			where: { slug },
			include: { inventory: true, }
		})
		if (!item) {
			throw new NotFoundException(`Item with slug ${slug} not found`);
		}
		return item;
	}

	async update(slug: string, updateItemDto: UpdateItemDto): Promise<Item> {
		try {
			return await this.prisma.item.update({
				where: { slug: slug },
				data: {
					name: updateItemDto.name,
					slug: slugify(updateItemDto.name ?? ''),
				},
			});
		} catch (err) {
			throw new NotFoundException(`Item with slug ${slug} not found`);
		}
	}

	async remove(id: string): Promise<Item> {
		try {
			return await this.prisma.item.delete({
				where: { id: Number(id) },
			});
		} catch (err) {
			throw new NotFoundException(`Item with id ${id} not found`);
		}
	}
}
