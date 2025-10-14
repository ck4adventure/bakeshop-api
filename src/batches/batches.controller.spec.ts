import { Test, TestingModule } from '@nestjs/testing';
import { BatchesController } from './batches.controller';
import { BatchesService } from './batches.service';

describe('BatchesController', () => {
	let controller: BatchesController;
	let service: BatchesService;

	beforeEach(async () => {
		const mockBatchesService = {
			createBatch: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			controllers: [BatchesController],
			providers: [{ provide: BatchesService, useValue: mockBatchesService }],
		}).compile();

		controller = module.get<BatchesController>(BatchesController);
		service = module.get<BatchesService>(BatchesService);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	describe('createBatch', () => {
		it('should call batchesService.createBatch and return its result', async () => {
			const body = { productId: 1, quantity: 10 };
			const result = { itemId: 1, quantity: 10, updatedAt: new Date() };
			const spy = jest.spyOn(service, 'createBatch').mockResolvedValue(result);

			await expect(controller.createBatch(body)).resolves.toMatchObject({
				itemId: 1,
				quantity: 10,
				updatedAt: expect.any(Date),
			});
			expect(spy).toHaveBeenCalledWith(body.productId, body.quantity);
		});

		it('should propagate errors thrown by batchesService.createBatch', async () => {
			const body = { productId: 1, quantity: 10 };
			const error = new Error('Inventory error');
			jest.spyOn(service, 'createBatch').mockRejectedValue(error);

			await expect(controller.createBatch(body)).rejects.toThrow(
				'Inventory error',
			);
		});
	});
});
