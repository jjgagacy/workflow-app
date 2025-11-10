import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from '@/app.module';
import { ModelProviderPlugin } from '@/ai/model_runtime/classes/plugin/model-provider.plugin';

describe('ModelProviderPlugin (e2e)', () => {
    // jest.setTimeout(30000);
    let app: INestApplication<App>;
    let modelProviderPlugin: ModelProviderPlugin;
    let connected = false;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
        modelProviderPlugin = app.get<ModelProviderPlugin>(ModelProviderPlugin);
        // trigger connect redis because lazy connect
        connected = true;
    });

    it('should initialize ok', async () => {
        expect(modelProviderPlugin).toBeDefined();
    });

    afterAll(async () => {
        await app.close();
    });
});
