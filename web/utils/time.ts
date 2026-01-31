export const sleep = (ms: number = 2000): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

export async function delayed<T>(fn: () => T, ms: number = 2000): Promise<T> {
  await sleep(ms);
  return fn();
}