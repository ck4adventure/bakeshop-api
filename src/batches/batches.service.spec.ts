import { Test, TestingModule } from '@nestjs/testing';
import { BatchesService } from './batches.service';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryReason } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('BatchesService', () => {
	let service: BatchesService;
	let prisma: PrismaService;

	beforeEach(async () => {
		const mockPrisma = {
			item: {
				findUnique: jest.fn(),
			},
			itemInventory: {
				upsert: jest.fn(),
			},
			inventoryTransaction: {
				create: jest.fn(),
			},
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				BatchesService,
				{ provide: PrismaService, useValue: mockPrisma },
			],
		}).compile();

		service = module.get<BatchesService>(BatchesService);
		prisma = module.get<PrismaService>(PrismaService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('createBatch', () => {
		it('should throw BadRequestException for invalid itemId', async () => {
			await expect(service.createBatch(0, 10)).rejects.toThrow(BadRequestException);
			await expect(service.createBatch(-1, 10)).rejects.toThrow(BadRequestException);
			await expect(service.createBatch(1.5, 10)).rejects.toThrow(BadRequestException);
		});

		it('should throw BadRequestException for invalid quantity', async () => {
			await expect(service.createBatch(1, 0)).rejects.toThrow(BadRequestException);
			await expect(service.createBatch(1, -5)).rejects.toThrow(BadRequestException);
			await expect(service.createBatch(1, 2.5)).rejects.toThrow(BadRequestException);
		});

		it('should throw NotFoundException if item does not exist', async () => {
			(prisma.item.findUnique as jest.Mock).mockResolvedValue(null);
			await expect(service.createBatch(1, 10)).rejects.toThrow(NotFoundException);
		});

		it('should update inventory and log transaction', async () => {
			const itemId = 1;
			const quantity = 10;
			const now = new Date();
			const inventoryResult = { itemId, quantity, updatedAt: now };
			(prisma.item.findUnique as jest.Mock).mockResolvedValue({ id: itemId });
			const upsertSpy = jest.spyOn(prisma.itemInventory, 'upsert').mockResolvedValue(inventoryResult);
			const transactionResult = {
				itemId,
				quantity,
				id: 1,
				createdAt: now,
				reason: InventoryReason.BATCH,
			};
			const createSpy = jest.spyOn(prisma.inventoryTransaction, 'create').mockResolvedValue(transactionResult);

			const result = await service.createBatch(itemId, quantity);
			expect(result).toEqual(inventoryResult);
			expect(upsertSpy).toHaveBeenCalledWith({
				where: { itemId },
				update: { quantity: { increment: quantity } },
				create: { itemId, quantity },
			});
			expect(createSpy).toHaveBeenCalledWith({
				data: {
					itemId,
					quantity,
					reason: InventoryReason.BATCH,
				},
			});
		});

			it('should propagate errors from prisma', async () => {
				const itemId = 1;
				const quantity = 10;
				const error = new Error('Prisma error');
				// Ensure item exists so NotFoundException is not thrown
				(prisma.item.findUnique as jest.Mock).mockResolvedValue({ id: itemId });
				jest.spyOn(prisma.itemInventory, 'upsert').mockRejectedValue(error);

				await expect(service.createBatch(itemId, quantity)).rejects.toThrow('Prisma error');
			});
	});
});
