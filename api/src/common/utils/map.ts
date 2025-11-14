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

export function groupToMaps<K, T>(items: T[], keyFn: (item: T) => K): Map<K, T[]> {
  const m = new Map<K, T[]>();
  for (const item of items) {
    const key = keyFn(item);
    const group = m.get(key) ?? [];
    group.push(item);
    m.set(key, group);
  }
  return m;
}

export function groupToMap<K, T>(items: T[], keyFn: (item: T) => K): Map<K, T> {
  const m = new Map<K, T>();
  for (const item of items) {
    const key = keyFn(item);
    m.set(key, item);
  }
  return m;
}
