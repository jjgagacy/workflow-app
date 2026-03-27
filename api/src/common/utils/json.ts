// Safe stringify function that handles circular references
export function safeStringify(obj: any, space?: number): any {
  const seen = new WeakSet();

  const replacer = (key: string, value: any) => {
    // Handle circular references
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular Reference]';
      }
      seen.add(value);
    }
    // Handle special types
    if (value instanceof Error) {
      return {
        name: value.name,
        message: value.message,
        stack: value.stack
      };
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (value instanceof RegExp) {
      return value.toString();
    }

    if (typeof value === 'function') {
      return '[Function]';
    }

    if (value instanceof Map) {
      return Object.fromEntries(value);
    }

    if (value instanceof Set) {
      return Array.from(value);
    }

    if (value instanceof Uint8Array) {
      return Array.from(value);
    }

    return value;
  };
  // Return parsed object if it's an object, otherwise return the stringified version
  const stringified = JSON.stringify(obj, replacer, space);
  return stringified ? JSON.parse(stringified) : obj;
}