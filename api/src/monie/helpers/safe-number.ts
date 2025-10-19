export function getSafeNumber(value: any, defaultValue: number, options: { min?: number; max?: number; integerOnly?: boolean; } = {}): number {
    const { min = -Infinity, max = Infinity, integerOnly = false } = options;

    let parsed: number;

    if (integerOnly) {
        parsed = parseInt(value?.toString(), 10);
    } else {
        parsed = Number(value);
    }

    if (Number.isNaN(parsed)) {
        return defaultValue;
    }

    if (parsed < min || parsed > max) {
        return defaultValue;
    }

    return parsed;
}