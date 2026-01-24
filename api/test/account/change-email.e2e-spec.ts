import { AccountService } from "@/account/account.service";
import { AccountEntity } from "@/account/entities/account.entity";
import { AppModule } from "@/app.module";
import { EnhanceCacheService } from "@/common/services/cache/enhance-cache.service";
import { EmailLanguage } from "@/mail/mail-i18n.service";
import { AuthAccountService } from "@/service/auth-account.service";
import { TokenManagerService } from "@/service/libs/token-manager.service";
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { App } from "supertest/types";
import { DataSource } from "typeorm";

describe('ChangeEmail (e2e)', () => {
  let app: INestApplication<App>;
  let authAccountService: AuthAccountService;
  let tokenManagerService: TokenManagerService;
  let dataSource: DataSource;
  let accountService: AccountService;
  let cacheService: EnhanceCacheService;
  const testEmail = 'jjgagacy@163.com';
  let account: AccountEntity | null;
  let language: EmailLanguage = EmailLanguage.ZH_HANS;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    authAccountService = app.get<AuthAccountService>(AuthAccountService);
    tokenManagerService = app.get<TokenManagerService>(TokenManagerService);
    accountService = app.get<AccountService>(AccountService);
    cacheService = app.get<EnhanceCacheService>(EnhanceCacheService);
    dataSource = app.get<DataSource>(DataSource);
    // 触发连接redis
    await cacheService.get('foo');
    account = await accountService.getByEmail(testEmail);
  });

  describe('change email send and validate', () => {
    it('should send change email and validate', async () => {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const token = await authAccountService.sendChangeEmailVerification(account!, language, code);
      expect(token).toBeDefined();

      await authAccountService.validateChangeEmailCode(testEmail, token, code);
    });
  });

  describe('confirm email new and validate', () => {
    it('should send confirm email and validate', async () => {
      const newEmail = '511268609@qq.com';
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const token = await authAccountService.sendConfirmEmailVerification(account!, newEmail, language, code);
      expect(token).toBeDefined();

      await authAccountService.validateAccountNewEmailCode(newEmail, token, code);
    });
  });

  // afterAll(async () => {
  //   await app.close();
  // });

});
