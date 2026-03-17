export function snakeToCamel(str: string): string {
  return str.replace(/[-_]+(.)?/g, (_, chr) =>
    chr ? chr.toUpperCase() : ''
  );
}

export function camelToSnake(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .replace(/[-\s]+/g, '_')
    .toLowerCase();
}

export function deepCamelToSnake(input: any): any {
  if (Array.isArray(input)) {
    return input.map(deepCamelToSnake);
  }

  if (
    input !== null &&
    typeof input === 'object' &&
    input.constructor === Object
  ) {
    return Object.entries(input).reduce((acc, [key, value]) => {
      const newKey = camelToSnake(key);
      acc[newKey] = deepCamelToSnake(value);
      return acc;
    }, {} as Record<string, any>);
  }

  return input;
}

export function deepSnakeToCamel(input: any, excludeKeys: Set<string> = new Set()): any {
  if (Array.isArray(input)) {
    return input.map(item => deepSnakeToCamel(item, excludeKeys));
  }

  if (input !== null && typeof input === 'object' && input.constructor === Object) {
    return Object.entries(input).reduce((acc, [key, value]) => {
      const newKey = snakeToCamel(key);
      if (excludeKeys.has(key)) {
        acc[key] = value;
      } else {
        acc[newKey] = deepSnakeToCamel(value, excludeKeys);
      }
      return acc;
    }, {} as Record<string, any>);
  }

  return input;
}