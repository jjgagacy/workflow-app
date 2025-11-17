import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from '@/app.module';
import { ProviderCredentialsCacheProps, ProviderCredentialsCacheService } from '@/ai/model_runtime/services/provider-credentials-cache.service';
import { EnhanceCacheService } from '@/common/services/cache/enhance-cache.service';
import { CredentialsCacheOptions, CredentialsCacheType } from '@/ai/model_runtime/types/cache.type';
import { Credentials } from '@/ai/model_runtime/types/credentials.type';
import { TenantNotFoundError } from '@/service/exceptions/tenant.error';
import { EncryptionService } from '@/encryption/encryption.service';
import * as crypto from 'crypto';
import { promisify } from 'util';

const generateKeyPairAsync = promisify(crypto.generateKeyPair);

describe('ProviderCredentialsCacheServiceTest (e2e)', () => {
    jest.setTimeout(10000);
    let app: INestApplication<App>;
    let credentialsCacheService: ProviderCredentialsCacheService;
    let cacheService: EnhanceCacheService;
    let encryptionService: EncryptionService;
    let connected = false;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        credentialsCacheService = app.get<ProviderCredentialsCacheService>(ProviderCredentialsCacheService);
        // trigger connect redis because lazy connect
        cacheService = app.get<EnhanceCacheService>(EnhanceCacheService);
        encryptionService = app.get<EncryptionService>(EncryptionService);
        cacheService.get('foo');
        connected = true;
    });

    it('should encrypt and decrypt correctly', async () => {
        const plaintext = 'Hello Hybrid Encryption!';
        const { publicKey, privateKey } = await encryptionService.generateKeyPair();

        const encrypted = encryptionService.encrypt(plaintext, publicKey);
        expect(Buffer.isBuffer(encrypted)).toBe(true);

        const decrypted = encryptionService.decrypt(encrypted, privateKey);
        expect(decrypted).toBe(plaintext);
    });

    afterAll(async () => {
        await app.close();
    });
});
