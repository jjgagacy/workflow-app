import { AppModule } from "@/app.module";
import { GeneralCacheService } from "@/service/caches/general-cache.service";
import { EnhanceCacheService } from "@/service/caches/enhance-cache.service";
import { Cache, CACHE_MANAGER, CacheKey, CacheTTL } from "@nestjs/cache-manager";
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { App } from "supertest/types";
import { setModuleRef } from "@/common/modules/global";
import { FeatureService } from "@/service/feature.service";

describe('FeatureService tests', () => {
    let app: INestApplication<App>;
    let featureService: FeatureService;
    const testTenantId = '106bd7b2-29d5-4b7e-bc2c-0dc14b1a966a';

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
        setModuleRef(app);
        featureService = app.get<FeatureService>(FeatureService);
    });

    describe('GetFeature test', () => {
        it('should can get feature', async () => {
            const feature = await featureService.getFeatures(testTenantId);
            console.log(feature);
            expect(feature).toBeDefined();
        });
    });

    afterAll(async () => {
        await app.close();
    });
})