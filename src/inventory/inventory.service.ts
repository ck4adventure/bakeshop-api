import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class InventoryService {
		constructor(private prisma: PrismaService) {}
  async findAll() {
		// query db for ItemInventory list, should be unique on itemId as pkey
		// join with Items table on itemId
		// const results = await this.prisma.itemInventory.findMany({include: {
		// 	item: {
		// 		select: {
		// 			name: true,
		// 			slug: true
		// 		}
		// 	}
		// }})

		// return this.prisma.itemInventory.findMany()
		return this.prisma.itemInventory.findMany({include: {
			item: {
				select: {
					name: true,
					slug: true
				}
			}
		}})
  }
}
