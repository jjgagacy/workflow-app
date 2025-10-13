export class MapUtils {
    static filter<K, V>(map: Map<K, V>, predicate: (key: K, value: V) => boolean): Map<K, V> {
        const result = new Map<K, V>();
        for (const [key, value] of map) {
            if (predicate(key, value)) {
                result.set(key, value);
            }
        }
        return result;
    }

    static map<K, V, U>(map: Map<K, V>, mapper: (value: V, key: K) => U): Map<K, U> {
        const result = new Map<K, U>();
        for (const [key, value] of map) {
            result.set(key, mapper(value, key));
        }
        return result;
    }

    static toObject<K extends string | number | symbol, V>(map: Map<K, V>): Record<K, V> {
        const obj = {} as Record<K, V>;
        for (const [key, value] of map) {
            obj[key] = value;
        }
        return obj;
    }
}
