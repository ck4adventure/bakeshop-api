// test/utils/setup-controller-test.ts
import { TestingModule, Test } from '@nestjs/testing';

export async function setupControllerTest<C, S extends Record<string, any>>(
  Controller: new (...args: any[]) => C,
  Service: new (...args: any[]) => S,
  mockService: Partial<S>,
) {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [Controller],
    providers: [{ provide: Service, useValue: mockService }],
  }).compile();

  const controller = module.get<C>(Controller);
  const service = module.get<S>(Service);

  return { controller, service };
}
