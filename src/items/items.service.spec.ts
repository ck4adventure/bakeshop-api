import { Test, TestingModule } from '@nestjs/testing';
import { ItemsService } from './items.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ItemsService', () => {
	let service: ItemsService;
	let prisma: PrismaService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ItemsService,
				{
					provide: PrismaService,
					useValue: {
						items: {
							findMany: jest.fn(),
						},
					},
				},
			],
		}).compile();

		service = module.get<ItemsService>(ItemsService);
		prisma = module.get<PrismaService>(PrismaService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('findAll', () => {
		// it('should return an array of items', async () => {
		// 	const mockItems = [{ id: '1', name: 'Item 1' }];
		// 	const findAllSpy = jest.spyOn(service, 'findAll').mockResolvedValue(mockItems as any);

		// 	const result = await service.findAll();
		// 	expect(result).toBe(mockItems);
		// 	expect(findAllSpy).toHaveBeenCalled();
		// });

		it('should return empty array if no items found', async () => {
			(prisma.items.findMany as jest.Mock).mockResolvedValue([]);

			const result = await service.findAll();
			expect(result).toEqual([]);
		});

		it('should return items if found', async () => {
			const mockItems = [{ id: 1, name: 'Test item' }];
			(prisma.items.findMany as jest.Mock).mockResolvedValue(mockItems);

			const result = await service.findAll();
			expect(result).toEqual(mockItems);
		});

		it('should throw an error if prisma fails', async () => {
			const error = new Error('Database error');
			(prisma.items.findMany as jest.Mock).mockRejectedValue(error);

			await expect(service.findAll()).rejects.toThrow('Database error');
		});
	});
});