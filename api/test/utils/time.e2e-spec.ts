import { toISOWithOffset } from "@/common/utils/time";

describe('toISOWithOffset (e2e)', () => {
    const baseDate = new Date('2025-11-09T00:00:00.000Z'); // UTC 时间

    it('should format IOS string for Asia/Shanghai', () => {
        console.log(toISOWithOffset(new Date(), 'Asia/Shanghai'));
    });

    it('should format ISO string for Asia/Taipei (+08:00)', () => {
        const result = toISOWithOffset(baseDate, 'Asia/Taipei');
        expect(result).toBe('2025-11-09T08:00:00.000+08:00');
    });

    it('should format ISO string for America/New_York (-05:00)', () => {
        const result = toISOWithOffset(baseDate, 'America/New_York');
        expect(result).toBe('2025-11-08T19:00:00.000-05:00');
    });

    it('should format ISO string for Europe/London (UTC)', () => {
        const result = toISOWithOffset(baseDate, 'Europe/London');
        expect(result).toBe('2025-11-09T00:00:00.000+00:00');
    });

    it('should include milliseconds precision', () => {
        const date = new Date('2025-11-09T00:00:00.123Z');
        const result = toISOWithOffset(date, 'Asia/Taipei');
        expect(result).toBe('2025-11-09T08:00:00.123+08:00');
    });

    it('should work for negative offsets (e.g. Los Angeles)', () => {
        const result = toISOWithOffset(baseDate, 'America/Los_Angeles');
        expect(result.endsWith('-08:00') || result.endsWith('-07:00')).toBe(true); // DST 兼容
    });
});