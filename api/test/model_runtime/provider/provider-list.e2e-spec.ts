import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from '@/app.module';
import { ProviderListService } from '@/ai/model_runtime/services/provider-list.service';
import { QueryProviderDto } from '@/ai/model_runtime/dtos/provider.dto';

describe('ProviderList (e2e)', () => {
    // jest.setTimeout(30000);
    let app: INestApplication<App>;
    let providerListService: ProviderListService;
    let connected = false;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
        providerListService = app.get<ProviderListService>(ProviderListService);
        // trigger connect redis because lazy connect
        connected = true;
    });

    it('should initialize ok', async () => {
        expect(providerListService).toBeDefined();
    });

    it('should get provider list', async () => {
        const dto: QueryProviderDto = { providerName: 'openai', isValid: true, page: 2, limit: 10 } as QueryProviderDto;
        const data = await providerListService.query(dto);
        console.log(data);
    });

    afterAll(async () => {
        await app.close();
    });
});
