import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AcceptLanguageResolver, HeaderResolver, I18nModule, QueryResolver } from "nestjs-i18n";
import { join } from 'path';

@Global()
@Module({
    imports: [
        I18nModule.forRootAsync({
            useFactory: (configService: ConfigService) => ({
                fallbackLanguage: configService.getOrThrow('FALLBACK_LANGUAGE'),
                fallbacks: {
                    'zh': 'zh-Hans',
                    'zh-*': 'zh-Hans',
                    'zh-CN': 'zh-Hans',
                    'zh-TW': 'zh-Hans',
                },
                loaderOptions: {
                    path: join(__dirname, '/../i18n/'),
                    watch: true,
                },
                typesOutputPath: join(__dirname, '/../../src/generated/i18n.generated.ts'),
            }),
            resolvers: [
                { use: QueryResolver, options: ['lang'] },
                AcceptLanguageResolver,
                new HeaderResolver(['x-lang']),
            ],
            inject: [ConfigService],
        })
    ],
    exports: [I18nModule]
})
export class I18nGlobalModule { }
