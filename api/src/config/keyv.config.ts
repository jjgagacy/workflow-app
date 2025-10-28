import { RedisUrlBuilder } from "@/common/utils/redis-url";
import { DefaultConfigValues } from "@/monie/constants/default-config-value";
import KeyvRedis, { RedisClientOptions } from "@keyv/redis";
import { ConfigService } from "@nestjs/config";
import { CacheableMemory, Keyv, KeyvOptions } from "cacheable";

export const transformKeyv = (obj: any): any => {
    if (obj instanceof Date) {
        return { __type: 'Date', value: obj.toISOString() };
    }

    if (Array.isArray(obj)) {
        return obj.map(transformKeyv);
    }

    if (obj && typeof obj === 'object' && !(obj instanceof Date)) {
        const result: any = {};
        for (const [key, value] of Object.entries(obj)) {
            result[key] = transformKeyv(value);
        }
        return result;
    }

    return obj;
};

export const serializeCustom = (data: any) => {
    return JSON.stringify(transformKeyv(data));
}

export const deserializeCustom = (data: any) => {
    return JSON.parse(data, (key, value) => {
        if (value && value.__type === 'Date') {
            return new Date(value.value);
        }
        return value;
    });
}

export const keyvConfig = async (configService: ConfigService) => {
    const connectOptions: RedisClientOptions = {
        url: RedisUrlBuilder.buildUrl(configService),
    }
    const options: KeyvOptions = {
        serialize: JSON.stringify,
        deserialize: JSON.parse,
    };
    return {
        ttl: configService.get<number>('CACHE_TTL', DefaultConfigValues.CACHE_TTL), // 默认缓存时间，单位秒
        stores: [
            new Keyv({
                store: new CacheableMemory({
                    ttl: configService.get<number>('CACHE_TTL', DefaultConfigValues.CACHE_TTL),
                    lruSize: configService.get<number>('CACHE_TTL', DefaultConfigValues.CACHE_LRU_SIZE),
                }),
                serialize: serializeCustom,
                deserialize: deserializeCustom,
            }),
            new KeyvRedis(connectOptions, options)
        ]
    };
}