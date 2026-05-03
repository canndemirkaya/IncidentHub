import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('App e2e', () => {
    let app: INestApplication;
    beforeAll(async () => {
        const modRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
        app = modRef.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('/health (GET)', async () => {
        await request(app.getHttpServer()).get('/health').expect(200).expect((res: any) => {
            expect(res.body.status).toBe('ok')
        })
    })
})
