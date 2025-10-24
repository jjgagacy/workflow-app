import { getSupportedLanguages, getSupportedTimezones, getTimezoneByLanguage, safeSupportedLanguage, supportedLanguage } from "@/common/constants/timezone";

describe('Language Service e2e tests', () => {
    describe('supported function', () => {
        it('should return language code for supported language', () => {
            // Test various supported languages
            expect(supportedLanguage('en-US')).toBe('en-US');
            expect(supportedLanguage('zh-Hans')).toBe('zh-Hans');
            expect(supportedLanguage('ja-JP')).toBe('ja-JP');
            expect(supportedLanguage('fr-FR')).toBe('fr-FR');
        });

        it('should throw error for unsupported languages', () => {
            // Test unsupported languages
            expect(() => supportedLanguage('xx-XX')).toThrow();
            expect(() => supportedLanguage('')).toThrow();
            expect(() => supportedLanguage('en')).toThrow();
            expect(() => supportedLanguage('zh-CN')).toThrow();
        });

        it('should handle case sensitivity correctly', () => {
            // Language codes are case-sensitive
            expect(() => supportedLanguage('en-us')).toThrow();
            expect(() => supportedLanguage('EN-US')).toThrow();
        });

        describe('safeSupportedLanguage function', () => {
            it('should return language code for supported languages', () => {
                expect(safeSupportedLanguage('en-US')).toBe('en-US');
                expect(safeSupportedLanguage('zh-Hans')).toBe('zh-Hans');
                expect(safeSupportedLanguage('ko-KR')).toBe('ko-KR');
            });

            it('should return null for unsupported languages', () => {
                expect(safeSupportedLanguage('xx-XX')).toBeNull();
                expect(safeSupportedLanguage('')).toBeNull();
                expect(safeSupportedLanguage('invalid')).toBeNull();
            });
        });
    });

    describe('getSupportedLanguages function', () => {
        it('should return all supported languages', () => {
            const languages = getSupportedLanguages();

            expect(languages).toContain('en-US');
            expect(languages).toContain('zh-Hans');
            expect(languages).toContain('ja-JP');
            expect(languages).toContain('fr-FR');
            expect(languages).toContain('de-DE');

            // Should not contain unsupported languages
            expect(languages).not.toContain('xx-XX');
            expect(languages).not.toContain('en');

            // Check array length to ensure all languages are included
            expect(languages.length).toBeGreaterThan(10);
        });
    });

    describe('getSupportedTimezones function', () => {
        it('should return all supported timezones', () => {
            const timezones = getSupportedTimezones();

            expect(timezones).toContain('America/New_York');
            expect(timezones).toContain('Asia/Shanghai');
            expect(timezones).toContain('Asia/Tokyo');
            expect(timezones).toContain('Europe/Paris');
            expect(timezones).toContain('Europe/Berlin');

            // Should not contain unrelated timezones
            expect(timezones).not.toContain('Pacific/Auckland');
            expect(timezones).not.toContain('Australia/Sydney');

            // Timezones array should have same length as languages array
            expect(timezones.length).toEqual(getSupportedLanguages().length);
        });
    });

    describe('getTimezoneByLanguage function', () => {
        it('should return correct timezone', () => {
            expect(getTimezoneByLanguage('en-US')).toBe('America/New_York');

            const zhZone = getTimezoneByLanguage('zh-Hans');
            expect(zhZone).toBe('Asia/Shanghai');

            console.log();

        });

        it('should return null for non-existent language', () => {
            expect(getTimezoneByLanguage('aaa')).toBeUndefined();
        });
    })

});