import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { setupControllerTest } from '../../test/utils/setup-controller-test';

describe('InventoryController', () => {
  let controller: InventoryController;
  let service: InventoryService;

  beforeEach(async () => {
    const mockInventoryService = {
      findAll: jest.fn(),
    };

    ({ controller, service } = await setupControllerTest(
      InventoryController,
      InventoryService,
      mockInventoryService,
    ));
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
