import * as MurmurHash3 from 'imurmurhash';

export function hashString(str: string): number {
  // 防御性判断：优先采用直接构造，其次采用 .default，最后降级
  const Constructor = (typeof MurmurHash3 === 'function'
    ? MurmurHash3
    : (MurmurHash3 as any).default || MurmurHash3) as any;

  return new Constructor(str).result();
}