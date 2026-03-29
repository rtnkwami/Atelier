import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { test, beforeEach, describe, expect } from 'vitest';
import { AppModule } from 'src/modules/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  test('/health (GET)', async () => {
    const response = await request(app.getHttpServer()).get('/health');
    expect(response.statusCode).toBe(200);
  });
});
