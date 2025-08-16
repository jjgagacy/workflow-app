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

