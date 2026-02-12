export function toCamelCase(str: string): string {
  return str.replace(/[-_]+(.)?/g, (_, chr) =>
    chr ? chr.toUpperCase() : ''
  );
}

export function deepCamelCase(input: any): any {
  if (Array.isArray(input)) {
    return input.map(deepCamelCase);
  }

  if (input !== null && typeof input === 'object' && input.constructor === Object) {
    return Object.entries(input).reduce((acc, [key, value]) => {
      const newKey = toCamelCase(key);
      acc[newKey] = deepCamelCase(value);
      return acc;
    }, {} as Record<string, any>);
  }

  return input;
}