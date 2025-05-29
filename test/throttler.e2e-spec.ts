import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Throttler', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 429 after exceeding rate limit', async () => {
    for (let i = 0; i < 10; i++) {
      await request(app.getHttpServer()).get('/').expect(200);
    }
    await request(app.getHttpServer()).get('/').expect(429);
  });
});