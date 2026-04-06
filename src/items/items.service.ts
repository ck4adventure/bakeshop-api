function slugify(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)+/g, '');
}
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { Item, InventoryReason } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ItemsService {
	constructor(private prisma: PrismaService) { }

	async create(createItemDto: CreateItemDto, bakeryId: string): Promise<Item> {
		const item = await this.prisma.item.create({
			data: {
				name: createItemDto.name,
				slug: slugify(createItemDto.name),
				bakeryId,
				...(createItemDto.par !== undefined && { par: createItemDto.par }),
				...(createItemDto.defaultBatchQty !== undefined && { defaultBatchQty: createItemDto.defaultBatchQty }),
				...(createItemDto.categoryId !== undefined && { categoryId: createItemDto.categoryId }),
			},
			include: { category: true },
		});

		if (createItemDto.initialQty && createItemDto.initialQty > 0) {
			await this.prisma.inventoryTransaction.create({
				data: {
					itemId: item.id,
					quantity: createItemDto.initialQty,
					reason: InventoryReason.ADJUSTMENT,
					note: 'Initial stock',
				},
			});
		}

		return item;
	}

	async findAll(bakeryId: string): Promise<Item[]> {
		return this.prisma.item.findMany({ where: { bakeryId }, include: { category: true } });
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
				...(updateItemDto.par !== undefined && { par: updateItemDto.par }),
				...(updateItemDto.defaultBatchQty !== undefined && { defaultBatchQty: updateItemDto.defaultBatchQty }),
				...(updateItemDto.categoryId !== undefined && { categoryId: updateItemDto.categoryId }),
			},
			include: { category: true },
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
