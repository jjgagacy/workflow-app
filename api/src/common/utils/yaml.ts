import fs from 'fs/promises';
import * as yaml from 'js-yaml';
import { deepSnakeToCamel } from './string';

export async function loadYamlFile<T>(filePath: string, transformKey = true): Promise<T> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const yamlData = yaml.load(content) as any;
    if (transformKey) {
      return deepSnakeToCamel(yamlData) as T;
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