import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from '@/app.module';
import { DataSource } from 'typeorm';
import { EmailLanguage, MailI18nService } from '@/mail/mail-i18n.service';
import { MailService } from '@/mail/mail.service';


describe('MailService', () => {
    let app: INestApplication<App>;
    let mailI18nService: MailI18nService;
    let mailService: MailService;
    let dataSource: DataSource;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
        mailI18nService = app.get<MailI18nService>(MailI18nService);
        mailService = app.get<MailService>(MailService);
    });

    it('should get mail service', () => {
        expect(mailService).toBeDefined();
    });

    // describe('sendInviteNumber', () => {
    //     it('should send Chinese invitation email successfully', async () => {
    //         await mailService.queue.sendInviteNumber({
    //             to: 'jjgagacy@163.com',
    //             inviterName: 'Monie',
    //             workspaceName: 'Sandbox',
    //             invitationUrl: 'http://ai.monie.cc/',
    //             expiryHours: 24,
    //             language: EmailLanguage.ZH_HANS,
    //         });
    //     });

    // it('should send English invitation email successfully', async () => {
    //     await mailService.queue.sendInviteNumber({
    //         to: 'jjgagacy@163.com',
    //         inviterName: 'John Smith',
    //         workspaceName: 'Development Team',
    //         invitationUrl: 'https://app.monie.cc/invite/abc123',
    //         expiryHours: 24,
    //         language: EmailLanguage.EN_US,
    //     });
    // });
    // });


    // describe('sendEmailCodeLogin', () => {
    //     it('should send Chinese login verification code email', async () => {
    //         const requestTime = new Date().toLocaleString('zh-CN');
    //         await mailService.queue.sendEmailCodeLogin({
    //             to: 'jjgagacy@163.com',
    //             verificationCode: '123456',
    //             expiryMinutes: '10',
    //             userEmail: 'jjgagacy@163.com',
    //             requestTime: requestTime,
    //             location: '北京, 中国',
    //             deviceInfo: 'Chrome on Windows',
    //             language: EmailLanguage.ZH_HANS,
    //         })
    //     });

    //     it('should send English login verification code email', async () => {
    //         const requestTime = new Date().toLocaleString('zh-CN');
    //         await mailService.queue.sendEmailCodeLogin({
    //             to: 'jjgagacy@163.com',
    //             verificationCode: '123456',
    //             expiryMinutes: '10',
    //             userEmail: 'jjgagacy@163.com',
    //             requestTime: requestTime,
    //             location: '北京, 中国',
    //             deviceInfo: 'Chrome on Windows',
    //             language: EmailLanguage.EN_US,
    //         });
    //     });
    // });

    // describe('sendResetPassword', () => {
    //     it('should send Chinese reset password email', async () => {
    //         await mailService.queue.sendResetPassword({
    //             to: 'jjgagacy@163.com',
    //             resetUrl: 'https://app.monie.cc/reset-password?token=abc123',
    //             expiryMinutes: '30',
    //             language: EmailLanguage.ZH_HANS,
    //         });
    //     });

    //     it('should send English reset password email', async () => {
    //         await mailService.queue.sendResetPassword({
    //             to: 'jjgagacy@163.com',
    //             resetUrl: 'https://app.monie.cc/reset-password?token=abc123',
    //             expiryMinutes: '30',
    //             language: EmailLanguage.EN_US,
    //         });
    //     });
    // });

    // describe('sendAccountDeletion', () => {
    //     it('should send account deletion verify email', async () => {
    //         await mailService.queue.sendAccountDeletion({
    //             to: 'jjgagacy@163.com',
    //             expiryMinutes: '30',
    //             language: EmailLanguage.ZH_HANS,
    //             verificationCode: '123456',
    //         })
    //     });

    //     it('should send account deletion verify email', async () => {
    //         await mailService.queue.sendAccountDeletion({
    //             to: 'jjgagacy@163.com',
    //             expiryMinutes: '30',
    //             language: EmailLanguage.EN_US,
    //             verificationCode: '123456',
    //         })
    //     });
    // });

    // describe('sendChangeEmailOld', () => {
    //     it('should send email change verification to old email', async () => {
    //         await mailService.queue.sendChangeEmailOld({
    //             to: 'jjgagacy@163.com',
    //             verificationCode: '777777',
    //             expiryMinutes: '30',
    //             oldEmail: 'old@example.com',
    //             newEmail: 'new@example.com',
    //             language: EmailLanguage.ZH_HANS,
    //         });
    //     });

    //     it('should send email change verification to old email', async () {
    //         await mailService.queue.sendChangeEmailOld({
    //             to: 'jjgagacy@163.com',
    //             verificationCode: '777777',
    //             expiryMinutes: '30',
    //             oldEmail: 'old@example.com',
    //             newEmail: 'new@example.com',
    //             language: EmailLanguage.EN_US,
    //         });
    //     });
    // });

    afterAll(async () => {
        await app.close();
    });
});