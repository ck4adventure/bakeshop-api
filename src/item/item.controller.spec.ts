import { Test, TestingModule } from '@nestjs/testing';
import { ItemController } from './item.controller';
import { ItemService } from './item.service';

describe('ItemController', () => {
	let controller: ItemController;
	let service: ItemService;

	beforeEach(async () => {
		const mockItemService = {
			findAll: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			controllers: [ItemController],
			providers: [
				{ provide: ItemService, useValue: mockItemService },
			],
		}).compile();

		controller = module.get<ItemController>(ItemController);
		service = module.get<ItemService>(ItemService);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	describe('findAll', () => {
		it('should call itemService.findAll and return its result', async () => {
			const result = [{ id: '1', name: 'Item 1' }];
			jest.spyOn(service, 'findAll').mockResolvedValue(result);

			await expect(controller.findAll()).resolves.toBe(result);
			expect(service.findAll).toHaveBeenCalled();
		});

		it('should return an empty array if itemService.findAll returns empty', async () => {
			jest.spyOn(service, 'findAll').mockResolvedValue([]);
			await expect(controller.findAll()).resolves.toEqual([]);
		});

		it('should propagate errors thrown by itemService.findAll', async () => {
			const error = new Error('Database error');
			jest.spyOn(service, 'findAll').mockRejectedValue(error);

			await expect(controller.findAll()).rejects.toThrow('Database error');
		});
	});
});