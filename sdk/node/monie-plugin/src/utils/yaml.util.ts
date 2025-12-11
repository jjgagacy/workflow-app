import fs from 'fs/promises';
import * as yaml from 'js-yaml';

export function snakeToCamel(str: string): string {
  return str.replace(/_+(\w)/g, (_, c) => c.toUpperCase());
}

export function camelToSnake(str: string): string {
  return str
    // 首先处理连续大写 → API → api
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
    // 再处理普通驼峰分隔
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .toLowerCase();
}

export function transformSnakeToCamel(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => transformSnakeToCamel(item));
  }

  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = snakeToCamel(key);
    result[camelKey] = transformSnakeToCamel(value);
  }
  return result;
}

export async function loadYamlFile<T>(filePath: string, transformKey = true): Promise<T> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const yamlData = yaml.load(content) as any;
    if (transformKey) {
      return transformSnakeToCamel(yamlData) as T;
    }
    return yamlData as T;
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err) {
      const e = err as NodeJS.ErrnoException;
      if (e.code === 'ENOENT') {
        throw new Error(`YAML file not found: ${filePath}`);
      }
    }

    if (err instanceof yaml.YAMLException) {
      throw new Error(`Invalid YAML syntax in ${filePath}: ${err.message}`)
    }

    if (err instanceof Error) {
      throw new Error(`Failed to load YAML file ${filePath}: ${err.message}`);
    }

    throw new Error(`Unknown error loading YAML file: ${filePath}: ${err}`);
  }
}
