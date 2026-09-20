export function toPlainObject(value: any): any {
  if (value === null || value === undefined) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(toPlainObject);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'object') {
    const plain: Record<string, any> = {};
    for (const [key, item] of Object.entries(value)) {
      plain[key] = toPlainObject(item);
    }
    return plain;
  }

  return value;
}