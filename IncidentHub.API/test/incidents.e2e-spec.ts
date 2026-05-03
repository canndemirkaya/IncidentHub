import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Incidents e2e', () => {
    let app: INestApplication;
    beforeAll(async () => {
        const modRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
        app = modRef.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('CRUD flow + soft delete', async () => {
        // create
        const createRes = await request(app.getHttpServer()).post('/incidents/Create').send({ title: 'e2e', description: 'd', service: 'Payment API', severity: 'high' }).expect(201);
        const id = createRes.body.data.id;

        // get by id
        await request(app.getHttpServer()).get(`/incidents/Get/${id}`).expect(200);

        // patch
        await request(app.getHttpServer()).patch(`/incidents/Update/${id}`).send({ status: 'investigating' }).expect(200);

        // list with filter
        const list = await request(app.getHttpServer()).get('/incidents/GetAll').query({ status: 'investigating' }).expect(200);
        expect(list.body.data.some((i: any) => i.id === id)).toBeTruthy();

        // delete (soft)
        await request(app.getHttpServer()).delete(`/incidents/Delete/${id}`).expect(200);

        // now get should 404
        await request(app.getHttpServer()).get(`/incidents/Get/${id}`).expect(404);
    })
})
