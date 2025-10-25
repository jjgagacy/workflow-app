export function getEnumKey<T extends Record<string, string | number>>(enumObj: T, value: string | number): keyof T {
    const key = Object.keys(enumObj).find(k =>
        enumObj[k] === value &&
        isNaN(Number(k)) // 排除数字键（反向映射）
    )
    if (!key) {
        throw new Error(`Invalid enum value: ${value}`);
    }
    return key;
}

export function getEnumValue<T extends Record<string, string | number>>(enumObj: T, key: keyof T): string | number {
    const value = enumObj[key];
    if (value === undefined) {
        throw new Error(`Invalid enum key: ${String(key)}`);
    }
    return value;
}

export function getEnumKeySafe<T extends Record<string, string | number>>(enumObj: T, value: string | number): string | null {
    const key = Object.keys(enumObj || {}).find(k => enumObj[k] === value);
    return key || null;
}

export function getEnumValueSafe<T extends Record<string, string | number>>(enumObj: T, key: keyof T): string | number | null {
    const value = enumObj[key];
    return value !== undefined ? value : null;
}

export class EnumUtils {
    static valueOf<T extends Record<string, string | number>>(enumObj: T, value: string | number): keyof T {
        return getEnumKey<T>(enumObj, value);
    }

    static toValue<T extends Record<string, string | number>>(enumObj: T, key: keyof T): string | number {
        return getEnumValue(enumObj, key);
    }

    static safeValueOf<T extends Record<string, string | number>>(enumObj: T, value: string | number): keyof T | null {
        return getEnumKeySafe(enumObj, value);
    }

    static safeToValue<T extends Record<string, string | number>>(enumObj: T, key: keyof T): string | number | null {
        return getEnumValueSafe(enumObj, key);
    }

    static getKey<T extends Record<string, string | number>>(enumObj: T, value: string | number): keyof T {
        return this.valueOf(enumObj, value);
    }

    static getKeySafe<T extends Record<string, string | number>>(enumObj: T, value: string | number): keyof T | null {
        return this.safeValueOf(enumObj, value);
    }

    static isEnumValue<T extends Record<string, string | number>>(enumObj: T, value: any): value is T[keyof T] {
        return Object.values(enumObj).includes(value);
    }

    static areAllEnumValues<T extends Record<string, string | number>>(enumObj: T, values: any[]): values is T[keyof T][] {
        return values.every(value => this.isEnumValue(enumObj, value));
    }

    static validateEnumValues<T extends Record<string, string | number>>(enumObj: T, values: any[], enumName: string = 'enum'): void {
        if (!this.areAllEnumValues(enumObj, values)) {
            throw new Error(`All values must be valid ${enumName} values`);
        }
    }

    static safeValidateEnumValues<T extends Record<string, string | number>>(enumObj: T, values: any[]): boolean {
        return this.areAllEnumValues(enumObj, values);
    }
}

