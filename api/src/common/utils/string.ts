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


export function deepSnakeToCamel(input: any): any {
  if (Array.isArray(input)) {
    return input.map(deepSnakeToCamel);
  }

  if (input !== null && typeof input === 'object' && input.constructor === Object) {
    return Object.entries(input).reduce((acc, [key, value]) => {
      const newKey = snakeToCamel(key);
      acc[newKey] = deepSnakeToCamel(value);
      return acc;
    }, {} as Record<string, any>);
  }

  return input;
}