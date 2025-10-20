import { I18nOptions } from 'nestjs-i18n';
import * as path from 'path';

export const i18nConfig: I18nOptions = {
    fallbackLanguage: 'en-US',
    loaderOptions: {
        path: path.join(__dirname, 'src/i18n/'),
        watch: true,
    },
    typesOutputPath: path.join(__dirname, 'src/generated/i18n.generated.ts'),
};

export default i18nConfig;