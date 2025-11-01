import { Global, Module } from "@nestjs/common";
import { BullModule } from '@nestjs/bull';
import { MailService } from "./mail.service";
import { MailProcessor } from "./mail.processor";
import { MailI18nService } from "./templates/mail.i18n";

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'mail',
        })
    ],
    providers: [MailService, MailProcessor, MailI18nService],
    exports: [MailService, BullModule, MailI18nService],
})
export class MailModule { }
