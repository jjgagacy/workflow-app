import { I18nObject } from "@/ai/model_runtime/classes/model-runtime.class"

describe('I18nObject Basic Functionality', () => {
    it('should create I18nObject with multiple language translations', () => {
        const welcomeMessage: I18nObject = {
            'en': 'Welcome to our application',
            'zh-CN': '欢迎使用我们的应用程序',
            'ja': '私たちのアプリケーションへようこそ',
            'ko': '우리 애플리케이션에 오신 것을 환영합니다'
        }
        expect(welcomeMessage['en']).toBe('Welcome to our application');
        expect(welcomeMessage['zh-CN']).toBe('欢迎使用我们的应用程序');
        expect(welcomeMessage['ja']).toBe('私たちのアプリケーションへようこそ');
        expect(typeof welcomeMessage).toBe('object');
    });

    it('should allow dynamic language key access', () => {
        const errMessage: I18nObject = {
            'en': 'An error occurred',
            'zh-CN': '发生了一个错误',
            'fr': 'Une erreur est survenue'
        }

        const language = 'zh-CN';
        expect(errMessage[language]).toBe('发生了一个错误');
        const anotherLanguage = 'fr';
        expect(errMessage[anotherLanguage]).toBe('Une erreur est survenue');
    })
});

describe('I18nObject in API response', () => {
    it('should handle I18nObject in REST API responses', async () => {
        // Simulate API response in REST API responses
        const mockApiResponse = {
            success: true,
            data: {
                id: 1,
                name: 'Test user',
            },
            message: {
                'en': 'User created successfully',
                'zh-CN': '用户创建成功',
                'ja': 'ユーザーが正常に作成されました'
            } as I18nObject
        }

        // Verify the structure
        expect(mockApiResponse.message['en']).toBe('User created successfully');
        expect(mockApiResponse.message['zh-CN']).toBe('用户创建成功');
        expect(typeof mockApiResponse.message).toBe('object');
    });

    it('should process I18nObject through service layer', () => {
        // Mock service that uses I18nObject
        class NotificationService {
            private readonly messages: Record<string, I18nObject> = {
                'welcome': {
                    'en': 'Welcome!',
                    'zh-CN': '欢迎！',
                    'ja': 'ようこそ！'
                },
                'error': {
                    'en': 'Something went wrong',
                    'zh-CN': '出了点问题',
                    'ja': '問題が発生しました'
                }
            }

            getMessage(key: string, language: string): string {
                return this.messages[key]?.[language] || this.messages[key]?.['en'] || 'Message not found';
            }
        }

        const service = new NotificationService();

        expect(service.getMessage('welcome', 'zh-CN')).toBe('欢迎！');
        expect(service.getMessage('error', 'ja')).toBe('問題が発生しました');
        expect(service.getMessage('nonexistent', 'en')).toBe('Message not found');
    });

    it('should work with fallback language strategy', () => {
        const getLocalizedText = (i18nObject: I18nObject, preferredLanguage: string): string => {
            return i18nObject[preferredLanguage] || i18nObject['en'] || Object.values(i18nObject)[0] || '';
        };

        const messages: I18nObject = {
            'en': 'Hello World',
            'zh-CN': '你好世界',
            'es': 'Hola Mundo'
        };

        // Preferred language exists
        expect(getLocalizedText(messages, 'zh-CN')).toBe('你好世界');

        // Fallback to English
        expect(getLocalizedText(messages, 'fr')).toBe('Hello World');

        // Fallback to first available
        const messagesWithoutEnglish: I18nObject = {
            'zh-CN': '你好世界',
            'es': 'Hola Mundo'
        };
        expect(getLocalizedText(messagesWithoutEnglish, 'fr')).toBe('你好世界');
    });
});
