function slugify(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)+/g, '');
}
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { Item } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ItemsService {
	constructor(private prisma: PrismaService) { }

	async create(createItemDto: CreateItemDto, bakeryId: string): Promise<Item> {
		return this.prisma.item.create({
			data: {
				name: createItemDto.name,
				slug: slugify(createItemDto.name),
				bakeryId,
			},
		});
	}

	async findAll(bakeryId: string): Promise<Item[]> {
		return this.prisma.item.findMany({ where: { bakeryId } });
	}

	async findOne(slug: string, bakeryId: string): Promise<Item> {
		const item = await this.prisma.item.findFirst({
			where: { slug, bakeryId },
			include: { inventory: true },
		});
		if (!item) {
			throw new NotFoundException(`Item with slug ${slug} not found`);
		}
		return item;
	}

	async update(slug: string, updateItemDto: UpdateItemDto, bakeryId: string): Promise<Item> {
		const existing = await this.prisma.item.findFirst({ where: { slug, bakeryId } });
		if (!existing) {
			throw new NotFoundException(`Item with slug ${slug} not found`);
		}
		return this.prisma.item.update({
			where: { id: existing.id },
			data: {
				name: updateItemDto.name,
				slug: slugify(updateItemDto.name ?? ''),
			},
		});
	}

	async remove(id: string, bakeryId: string): Promise<Item> {
		const existing = await this.prisma.item.findFirst({
			where: { id: Number(id), bakeryId },
		});
		if (!existing) {
			throw new NotFoundException(`Item with id ${id} not found`);
		}
		return this.prisma.item.delete({ where: { id: existing.id } });
	}
}
