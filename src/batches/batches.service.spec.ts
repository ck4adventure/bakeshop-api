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
			inventoryTransaction: {
				create: jest.fn(),
			},
			itemInventory: {
				findUnique: jest.fn(),
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

		it('should log an inventory transaction (trigger updates inventory)', async () => {
			const itemId = 1;
			const quantity = 10;
			const now = new Date();

			// Mock item exists
			(prisma.item.findUnique as jest.Mock).mockResolvedValue({ id: itemId });

			const transactionResult = {
				id: 123,
				itemId,
				quantity,
				reason: InventoryReason.BATCH,
				createdAt: now,
			};

			// The only explicit DB write is the transaction creation
			const createSpy = jest
				.spyOn(prisma.inventoryTransaction, 'create')
				.mockResolvedValue(transactionResult);

			// Optionally mock inventory lookup after trigger runs (if your service reads it back)
			(prisma.itemInventory.findUnique as jest.Mock).mockResolvedValue({
				itemId,
				quantity: 100, // expected new quantity after trigger
			});

			const result = await service.createBatch(itemId, quantity);

			expect(createSpy).toHaveBeenCalledWith({
				data: {
					itemId,
					quantity,
					reason: InventoryReason.BATCH,
				},
			});

			// Expect returned data to reflect post-trigger inventory state
			expect(result).toMatchObject({
				itemId,
				quantity: expect.any(Number),
			});
		});

		it('should propagate errors from prisma', async () => {
			const itemId = 1;
			const quantity = 5;
			const error = new Error('DB connection lost');

			(prisma.item.findUnique as jest.Mock).mockResolvedValue({ id: itemId });
			jest.spyOn(prisma.inventoryTransaction, 'create').mockRejectedValue(error);

			await expect(service.createBatch(itemId, quantity)).rejects.toThrow(error);
		});
	});
});
