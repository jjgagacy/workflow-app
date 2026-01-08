import { Inject, Injectable, InternalServerErrorException, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Cache } from "cache-manager";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Keyv } from "cacheable";
import KeyvRedis, { RedisClientType } from "@keyv/redis";
import { GlobalLogger } from "@/logger/logger.service";

@Injectable()
export class EnhanceCacheService implements OnModuleInit, OnModuleDestroy {
  private redisClient: any;
  private _isConnected = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private readonly HEARTBEAT_INTERVAL = 30000; // 30seconds
  private readonly RECONNECT_DELAY = 5000; // 5seconds

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly logger: GlobalLogger,
  ) { }

  async onModuleDestroy() {
    this.stopHeartbeat();
    await this.disconnect();
  }

  async onModuleInit() {
    await this.initializeConnection();
    this.startHeartbeat();
  }

  private async initializeConnection(): Promise<void> {
    try {
      this.redisClient = await this.getRedisClient();
      if (this.redisClient) {
        this.setupEventListeners();
        await this.testConnection();
        this._isConnected = true;
        this.logger.log("Redis connection initialized");
      }
    } catch (error) {
      this.logger.error(`Initial connection failed: ${error.message}`);
      await this.scheduleReconnect();
    }
  }

  private setupEventListeners(): void {
    if (!this.redisClient) return;

    this.redisClient.on('connect', () => {
      this._isConnected = true;
      this.logger.log('Redis connected');
    });

    this.redisClient.on('ready', () => {
      this._isConnected = true;
    });

    this.redisClient.on('error', (err: Error) => {
      this.logger.error(`Redis error: ${err.message}`);
      this._isConnected = false;
    });

    this.redisClient.on('end', () => {
      this.logger.warn('Redis disconnected');
      this._isConnected = false;
      this.scheduleReconnect();
    });

    this.redisClient.on('reconnecting', () => {
      this.logger.log('Redis reconnecting');
    });
  }

  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(async () => {
      await this.sendHeartbeat();
    }, this.HEARTBEAT_INTERVAL);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private async sendHeartbeat(): Promise<void> {
    if (!this.redisClient || !this._isConnected) {
      this.logger.log('Redis not connected');
      return;
    }

    try {
      await this.redisClient.ping?.();
    } catch (error) {
      this.logger.warn(`Heartbeat failed: ${error.message}`);
      this._isConnected = false;
      await this.reconnect();
    }
  }

  private async reconnect(): Promise<void> {
    try {
      await this.disconnect();
      await this.initializeConnection();
    } catch (error) {
      this.logger.error(`Reconnect failed: ${error.message}`);
      await this.scheduleReconnect();
    }
  }

  private async testConnection() {
    const maxAttempt = 5;
    for (let attempt = 1; attempt <= maxAttempt; attempt++) {
      try {
        await this.get('__test_connection__');
        return;
      } catch (error) {
        if (attempt <= maxAttempt) {
          await new Promise(resolve => setTimeout(resolve, 500));
          continue;
        }
        this.logger.error(`Connection test failed: ${error.message}`);
      }
    }
  }

  private async scheduleReconnect() {
    setTimeout(async () => {
      await this.reconnect();
    }, this.RECONNECT_DELAY);
  }

  private async disconnect() {
    try {
      if (this.redisClient) {
        await this.redisClient.quit?.();
      }
    } catch (error) {
      this.logger.error(`Error disconnect redis: ${error.message}`);
    } finally {
      this.redisClient = null;
      this._isConnected = false;
    }
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

  async exists(key: string): Promise<number> {
    const redisClient = await this.getRedisClient();
    if (!redisClient) {
      throw new InternalServerErrorException("Redis client not available");
    }
    return redisClient.exists(key);
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
    return this.scan({ pattern });
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

  get isConnected(): boolean {
    return this._isConnected;
  }

  async ping(): Promise<void> {
    const redisClient = await this.getRedisClient();
    await redisClient.ping();
  }
}
