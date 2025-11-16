import { AppModule } from "@/app.module";
import { GeneralCacheService } from "@/common/services/cache/general-cache.service";
import { EnhanceCacheService } from "@/common/services/cache/enhance-cache.service";
import { Cache, CACHE_MANAGER, CacheKey, CacheTTL } from "@nestjs/cache-manager";
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { App } from "supertest/types";
import { setModuleRef } from "@/common/modules/global";
import { ServiceCache } from "@/common/decorators/cache/service-cache.decorator";

describe('CacheManager tests', () => {
    let app: INestApplication<App>;
    let cacheManager: Cache;
    let cacheService: GeneralCacheService;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
        setModuleRef(app);
        cacheManager = app.get<Cache>(CACHE_MANAGER);
        cacheService = app.get<GeneralCacheService>(GeneralCacheService);
    });

    describe('Cache Functionality', () => {
        it('should set and get cache', async () => {
            const key = 'test_key';
            const value = "foo bar";

            await cacheManager.set(key, value, 60);

            const cacheValue = await cacheManager.get(key);
            expect(cacheValue).toEqual(value);
        });

        it('should set and get cache object', async () => {
            const key = 'test_object_key';
            const value = { data: "test_value", timestamp: new Date() };

            await cacheManager.set(key, value, 60);

            const cacheValue = await cacheManager.get(key);
            expect(cacheValue).toEqual(value);
        });
    });

    describe('Cache decorator test', () => {
        it('should cache function body', async () => {
            const firstCall = await cacheService.findAll();
            expect(firstCall).toBe('find all cats');

            const secondCall = await cacheService.findAll();
            expect(secondCall).toBe('find all cats');
        });

        it('should skip cache', async () => {
            const firstCall = await cacheService.findAll(-1);
            expect(firstCall).toBe('find all cats');

            const secondCall = await cacheService.findAll(-1);
            expect(secondCall).toBe('find all cats');
        });

        it('should skip cache', async () => {
            const firstCall = await cacheService.findOne();
            expect(firstCall).toBe('findOne');

            const secondCall = await cacheService.findOne();
            expect(secondCall).toBe('findOne');
        });

        // it('should cache', async () => {
        //     class TestService {
        //         @ServiceCache({ key: 'differentKey', ttl: 100 })
        //         async findDifferent(): Promise<string> {
        //             console.log('findDifferent called');
        //             return 'different result';
        //         }
        //     }
        //     const testService = new TestService();
        //     await testService.findDifferent();
        //     await testService.findDifferent();
        // });
    });

    afterAll(async () => {
        await app.close();
    });
})