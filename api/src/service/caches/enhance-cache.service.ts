import { Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { Cache } from "cache-manager";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Keyv } from "cacheable";
import KeyvRedis, { RedisClientType } from "@keyv/redis";
import { GlobalLogger } from "@/logger/logger.service";

@Injectable()
export class EnhanceCacheService {
    constructor(
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
        private readonly logger: GlobalLogger,
    ) {
        // this.getRedisClient().then(store => {
        //     if (store) {
        //         console.log(',,,,,', store)
        //         store.on('connect', () => {
        //             this.logger.log(`### redis client connected`);
        //         });
        //     }
        // });
        // 触发连接redis
        // setTimeout(async () => {
        //     await this.get('foo');
        // }, 1000);
    }

    private getRedisStore(): any {
        const stores = this.cacheManager.stores;
        return stores.find(store =>
            store instanceof Keyv && store.opts.store instanceof KeyvRedis
        );
    }

    async getRedisClient(): Promise<RedisClientType> {
        const redisStore = this.getRedisStore();
        return redisStore?.store?.client as RedisClientType;
    }

    async get<T>(key: string): Promise<T | undefined> {
        return this.cacheManager.get(key);
    }

    // ttl unit is milliseconds
    async set<T>(key: string, value: T, ttl?: number): Promise<T> {
        return this.cacheManager.set(key, value, ttl);
    }

    async del(key: string): Promise<boolean> {
        return this.cacheManager.del(key);
    }

    async incr(key: string, step = 1): Promise<number> {
        const redisClient = await this.getRedisClient();
        if (redisClient) {
            const currentValue = await this.cacheManager.get(key);
            if (currentValue && isNaN(parseInt(currentValue as any))) {
                await redisClient.del(key);
            }
            if (step > 0) {
                return await redisClient.incrBy(key, step);
            } else {
                return await redisClient.decrBy(key, Math.abs(step));
            }
        }

        const current = (await this.get<number>(key)) || 0;
        const newValue = current + step;
        await this.set(key, newValue);
        return newValue;
    }

    async listPush(key: string, ...values: any[]): Promise<number> {
        const redisClient = await this.getRedisClient();
        if (!redisClient) {
            throw new InternalServerErrorException("Redis client not available");
        }
        return await redisClient.rPush(key, values.map(v => JSON.stringify(v)));
    }

    async listRange<T>(key: string, start = 0, end = -1): Promise<T[]> {
        const redisClient = await this.getRedisClient();
        if (!redisClient) {
            throw new InternalServerErrorException("Redis client not available");
        }
        const items = await redisClient.lRange(key, start, end);
        return items.map(item => JSON.parse(item));
    }

    async setAdd(key: string, ...members: string[]): Promise<number> {
        const redisClient = await this.getRedisClient();
        if (!redisClient) {
            throw new InternalServerErrorException("Redis client not available");
        }
        return await redisClient.sAdd(key, members);
    }

    async setMembers(key: string): Promise<string[]> {
        const redisClient = await this.getRedisClient();
        if (!redisClient) {
            throw new InternalServerErrorException("Redis client not available");
        }
        return await redisClient.sMembers(key);
    }

    async hashSet(key: string, field: string, value: any): Promise<number> {
        const redisClient = await this.getRedisClient();
        if (!redisClient) {
            throw new InternalServerErrorException("Redis client not available");
        }
        return await redisClient.hSet(key, field, JSON.stringify(value));
    }

    async hashGet<T>(key: string, field: string): Promise<T | null> {
        const redisClient = await this.getRedisClient();
        if (!redisClient) {
            throw new InternalServerErrorException("Redis client not available");
        }
        const value = await redisClient.hGet(key, field);
        return value ? JSON.parse(value) as T : null;
    }

    async publish(channel: string, message: any): Promise<number> {
        const redisClient = await this.getRedisClient();
        if (!redisClient) {
            throw new InternalServerErrorException("Redis client not available");
        }
        return await redisClient.publish(channel, JSON.stringify(message));
    }

    // Note: EXPIRE would return 0 and not alter the timeout for a key with a timeout set.
    // and return 1 will be alter the timeout.
    async expire(key: string, seconds: number): Promise<number> {
        const redisClient = await this.getRedisClient();
        if (!redisClient) {
            throw new InternalServerErrorException("Redis client not available");
        }
        return await redisClient.expire(key, seconds);
    }

    async zAdd(key: string, score: number, member: string): Promise<number> {
        const redisClient = await this.getRedisClient();
        if (!redisClient) {
            throw new InternalServerErrorException("Redis client not available");
        }
        return await redisClient.zAdd(key, { score, value: member });
    }

    async zRemRangeByScore(key: string, min: number | string, max: number | string): Promise<number> {
        const redisClient = await this.getRedisClient();
        if (!redisClient) {
            throw new InternalServerErrorException("Redis client not available");
        }
        return await redisClient.zRemRangeByScore(key, min, max);
    }

    async zCard(key: string): Promise<number> {
        const redisClient = await this.getRedisClient();
        if (!redisClient) {
            throw new InternalServerErrorException("Redis client not available");
        }
        return await redisClient.zCard(key);
    }

    async zRange(key: string, start: number, stop: number): Promise<string[]> {
        const redisClient = await this.getRedisClient();
        if (redisClient) {
            return await redisClient.zRange(key, start, stop);
        }
        throw new InternalServerErrorException('Redis client not available');
    }

    async zRangeByScore(key: string, min: number | string, max: number | string): Promise<string[]> {
        const redisClient = await this.getRedisClient();
        if (!redisClient) {
            throw new InternalServerErrorException("Redis client not available");
        }
        return await redisClient.zRangeByScore(key, min, max);
    }

    async zRem(key: string, ...members: string[]): Promise<number> {
        const redisClient = await this.getRedisClient();
        if (!redisClient) {
            throw new InternalServerErrorException("Redis client not available");
        }
        return await redisClient.zRem(key, members);
    }

    async zScore(key: string, member: string): Promise<number | null> {
        const redisClient = await this.getRedisClient();
        if (!redisClient) {
            throw new InternalServerErrorException("Redis client not available");
        }
        return await redisClient.zScore(key, member);
    }

    async zRank(key: string, member: string): Promise<number | null> {
        const redisClient = await this.getRedisClient();
        if (!redisClient) {
            throw new InternalServerErrorException("Redis client not available");
        }
        return await redisClient.zRank(key, member);
    }

    async keys(pattern: string): Promise<string[]> {
        const redisClient = await this.getRedisClient();
        if (!redisClient) {
            throw new InternalServerErrorException("Redis client not available");
        }
        // todo
        return [];
    }

    async scan(options: {
        pattern?: string;
        count?: number;
        onBatch?: (key: string[]) => void;
    } = {}): Promise<string[]> {
        const redisClient = await this.getRedisClient();
        if (!redisClient) {
            throw new InternalServerErrorException("Redis client not available");
        }
        const { pattern = '*', count = 100, onBatch } = options;
        const allKeys: string[] = [];
        let cursor = '0';
        do {
            try {
                const result = await redisClient.scan(cursor, { MATCH: pattern, COUNT: count });
                cursor = result.cursor;
                if (result.keys.length > 0) {
                    allKeys.push(...result.keys);
                    onBatch?.(result.keys);
                }
            } catch (error) {
                throw error;
            }
        } while (cursor != '0');
        return allKeys;
    }

    async isConnected(): Promise<boolean> {
        const redisClient = await this.getRedisClient();
        return redisClient?.isOpen === true;
    }

    async ping(): Promise<void> {
        const redisClient = await this.getRedisClient();
        await redisClient.ping();
    }
}