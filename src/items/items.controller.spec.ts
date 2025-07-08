import { Test, TestingModule } from '@nestjs/testing';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';

describe('ItemsController', () => {
	let controller: ItemsController;
	let service: ItemsService;

	beforeEach(async () => {
		const mockItemsService = {
			findAll: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			controllers: [ItemsController],
			providers: [
				{ provide: ItemsService, useValue: mockItemsService },
			],
		}).compile();

		controller = module.get<ItemsController>(ItemsController);
		service = module.get<ItemsService>(ItemsService);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	describe('findAll', () => {
		it('should call itemsService.findAll and return its result', async () => {
			const result = [{ id: '1', name: 'Item 1' }];
			jest.spyOn(service, 'findAll').mockResolvedValue(result as any);

			await expect(controller.findAll()).resolves.toBe(result);
			expect(service.findAll).toHaveBeenCalled();
		});

		it('should return an empty array if itemsService.findAll returns empty', async () => {
			jest.spyOn(service, 'findAll').mockResolvedValue([]);
			await expect(controller.findAll()).resolves.toEqual([]);
		});

		it('should propagate errors thrown by itemsService.findAll', async () => {
			const error = new Error('Database error');
			jest.spyOn(service, 'findAll').mockRejectedValue(error);

			await expect(controller.findAll()).rejects.toThrow('Database error');
		});
	});
});
