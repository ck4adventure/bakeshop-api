import { Test, TestingModule } from '@nestjs/testing';
import { ItemService } from './item.service';

describe('ItemService', () => {
	let service: ItemService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [ItemService],
		}).compile();

		service = module.get<ItemService>(ItemService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('findAll', () => {
		it('should return an array of items', async () => {
			const mockItems = [{ id: '1', name: 'Item 1' }];
			const findAllSpy = jest.spyOn(service, 'findAll').mockResolvedValue(mockItems as any);

			const result = await service.findAll();
			expect(result).toBe(mockItems);
			expect(findAllSpy).toHaveBeenCalled();
		});

		it('should return an empty array if no items found', async () => {
			// @ts-ignore
			service.prisma.item.findMany = jest.fn().mockResolvedValue([]);

			const result = await service.findAll();
			expect(result).toEqual([]);
		});

		it('should throw an error if prisma throws', async () => {
			// @ts-ignore
			service.prisma.item.findMany = jest.fn().mockRejectedValue(new Error('DB error'));

			await expect(service.findAll()).rejects.toThrow('Failed to fetch items: DB error');
		});
	});
});