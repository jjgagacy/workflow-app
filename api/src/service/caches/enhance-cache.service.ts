import { Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { Cache } from "cache-manager";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Keyv } from "cacheable";
import KeyvRedis, { RedisClientConnectionType } from "@keyv/redis";

@Injectable()
export class EnhanceCacheService {
    constructor(
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    ) { }

    private getRedisStore(): any {
        const stores = this.cacheManager.stores;
        return stores.find(store =>
            store instanceof Keyv && store.opts.store instanceof KeyvRedis
        );
    }

    async getRedisClient(): Promise<RedisClientConnectionType> {
        const redisStore = this.getRedisStore();
        return redisStore?.store?.client as RedisClientConnectionType;
    }

    async get<T>(key: string): Promise<T | undefined> {
        return this.cacheManager.get(key);
    }

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
        if (redisClient) {
            return await redisClient.rPush(key, values.map(v => JSON.stringify(v)));
        }

        throw new InternalServerErrorException("Redis client not available");
    }

    async listRange<T>(key: string, start = 0, end = -1): Promise<T[]> {
        const redisClient = await this.getRedisClient();
        if (redisClient) {
            const items = await redisClient.lRange(key, start, end);
            return items.map(item => JSON.parse(item));
        }

        throw new InternalServerErrorException("Redis client not available");
    }

    async setAdd(key: string, ...members: string[]): Promise<number> {
        const redisClient = await this.getRedisClient();
        if (redisClient) {
            return await redisClient.sAdd(key, members);
        }

        throw new InternalServerErrorException("Redis client not available");
    }

    async setMembers(key: string): Promise<string[]> {
        const redisClient = await this.getRedisClient();
        if (redisClient) {
            return await redisClient.sMembers(key);
        }

        throw new InternalServerErrorException("Redis client not available");
    }

    async hashSet(key: string, field: string, value: any): Promise<number> {
        const redisClient = await this.getRedisClient();
        if (redisClient) {
            return await redisClient.hSet(key, field, JSON.stringify(value));
        }

        throw new InternalServerErrorException("Redis client not available");
    }

    async hashGet<T>(key: string, field: string): Promise<T | null> {
        const redisClient = await this.getRedisClient();
        if (redisClient) {
            const value = await redisClient.hGet(key, field);
            return value ? JSON.parse(value) as T : null;
        }

        throw new InternalServerErrorException("Redis client not available");
    }

    async publish(channel: string, message: any): Promise<number> {
        const redisClient = await this.getRedisClient();
        if (redisClient) {
            return await redisClient.publish(channel, JSON.stringify(message));
        }
        throw new InternalServerErrorException('Redis client not available');
    }


    async keys(pattern: string): Promise<string[]> {
        const redisClient = await this.getRedisClient();
        if (redisClient) {
            // todo

        }

        throw new InternalServerErrorException("Redis client not available");
    }

    // async isConnected(): Promise<boolean> {
    //     const client = await this.getRedisClient();
    //     if (!client) {
    //         return false;
    //     }

    //     try {
    //         if (typeof client.is)
    //     }
    // }
}