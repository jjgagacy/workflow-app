import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from '@/app.module';
import { AuthAccountService } from '@/service/auth-account.service';
import { DeviceService } from '@/service/libs/device.service';

describe('RateLimiter (e2e)', () => {
    let app: INestApplication<App>;
    let authAccountService: AuthAccountService;
    let deviceService: DeviceService;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        deviceService = app.get<DeviceService>(DeviceService);
    });

    it('should return zh-Hans when Accept-Language is zh-CH', async () => {
        const result = deviceService.getLanguageFromHeader('zh-CN');
        expect(result).toBe('zh-Hans');
    });

    it('should return en-US when Accept-Language is en', async () => {
        const result = deviceService.getLanguageFromHeader('en-US');
        expect(result).toBe('en-US');
    });

    it('should return "en-US" when Accept-Language is zh-CN;q=0.7,en-US;q=0.9', () => {
        const result = deviceService.getLanguageFromHeader('zh-CN;q=0.7,en-US;q=0.9');
        expect(result).toBe('en-US');
    });

    it('should return "en-US" when Accept-Language is en-US;q=0.9,zh-CN;q=0.7', () => {
        const result = deviceService.getLanguageFromHeader('en-US;q=0.9,zh-CN;q=0.7');
        expect(result).toBe('en-US');
    });

    it('should return "en-US" when Accept-Language is empty', () => {
        const result = deviceService.getLanguageFromHeader('');
        expect(result).toBe('en-US');
    });

    it('should return "en-US" when Accept-Language is fr-FR,es-ES;q=0.8,zh-CN;q=0.9', () => {
        const result = deviceService.getLanguageFromHeader('fr-FR,es-ES;q=0.8,zh-CN;q=0.9');
        expect(result).toBe('en-US');
    });

    afterAll(async () => {
        await app.close();
    });
});
