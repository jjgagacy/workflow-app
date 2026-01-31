import { searchParams } from "./search-params";

export const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function runSafe<T = any>(fn: Promise<T>): Promise<[Error] | [null, T]> {
  try {
    return [null, await fn];
  } catch (e: any) {
    return [e || new Error('unknown error')];
  }
}

export const buildQueryString = (
  searchParams: { [key: string]: string | string[] | undefined },
  newParams: Record<string, string | number> = {},
  excludeKeys: string[] = []
) => {
  const params = new URLSearchParams();

  // 添加现有参数
  Object.entries(searchParams).forEach(([key, value]) => {
    if (!excludeKeys.includes(key) && value) {
      if (Array.isArray(value)) {
        value.forEach(v => params.append(key, v));
      } else {
        params.set(key, value);
      }
    }
  });

  // 添加新参数
  Object.entries(newParams).forEach(([key, value]) => {
    params.set(key, String(value));
  });

  return params.toString();
}