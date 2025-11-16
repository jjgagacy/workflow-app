import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '@/app.module';
import { EnhanceCacheService } from '@/common/services/cache/enhance-cache.service';
import { count } from 'console';
import { BillingService } from '@/service/billing/billing.service';

describe('BillingService (e2e)', () => {
    let app: INestApplication<App>;
    let billingService: BillingService;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
        billingService = app.get<BillingService>(BillingService);
    });

    describe('billing account is in freeze', () => {
        it('should request billing url', async () => {
            const inFreeze = await billingService.isEmailInFreeze('test@email.com');
            expect(inFreeze).toBeDefined();
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
