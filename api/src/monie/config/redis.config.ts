import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { toBoolean } from "../helpers/to-boolean";
import { defaultConfigValues } from "../constants/default-config-value";

@Injectable()
export class RedisConfig {
    constructor(protected readonly configService: ConfigService
    ) { }

    redisHost(): string {
        return this.configService.get<string>('REDIS_HOST', defaultConfigValues.REDIS_HOST);
    }

    redisPort(): number {
        const port = this.configService.get<number>('REDIS_PORT', defaultConfigValues.REDIS_PORT);
        return Number(port);
    }

    redisUsername(): string | undefined {
        return this.configService.get<string>('REDIS_USERNAME');
    }

    redisPassword(): string | undefined {
        return this.configService.get<string>('REDIS_PASSWORD');
    }

    redisDb(): number {
        const db = this.configService.get<string>('REDIS_DB')
        return Number(db)
    }

    redisUseSsl(): boolean {
        return toBoolean(this.configService.get<boolean>('REDIS_USE_SSL', defaultConfigValues.REDIS_USE_SSL));
    }

    redisUseCluster(): boolean {
        return toBoolean(this.configService.get<boolean>('REDIS_USE_CLUSTER', defaultConfigValues.REDIS_USE_CLUSTER));
    }

    redisClusters(): string | undefined {
        return this.configService.get('REDIS_CLUSTERS');
    }

    redisClustersPassword(): string | undefined {
        return this.configService.get('REDIS_CLUSTERS');
    }

    redisSerializationProtocol(): number {
        const version = this.configService.get<number>('REDIS_SERIALIZATION_PROTOCOL', defaultConfigValues.REDIS_SERIALIZATION_PROTOCOL);
        return Number(version);
    }

    redisEnableClientSideCache(): boolean {
        return toBoolean(this.configService.get('REDIS_ENABLE_CLIENT_SIDE_CACHE', defaultConfigValues.REDIS_ENABLE_CLIENT_SIDE_CACHE))
    }
}