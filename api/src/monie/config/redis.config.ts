import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { toBoolean } from "../helpers/to-boolean";

@Injectable()
export class RedisConfig {
    constructor(protected readonly configService: ConfigService
    ) { }

    redisHost(): string {
        return this.configService.get<string>('REDIS_HOST', 'localhost');
    }

    redisPort(): number {
        const port = this.configService.get<number>('REDIS_PORT', 6379);
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
        return toBoolean(this.configService.get<boolean>('REDIS_USE_SSL', false));
    }

    redisUseCluster(): boolean {
        return toBoolean(this.configService.get<boolean>('REDIS_USE_CLUSTER', false));
    }

    redisClusters(): string | undefined {
        return this.configService.get('REDIS_CLUSTERS');
    }

    redisClustersPassword(): string | undefined {
        return this.configService.get('REDIS_CLUSTERS');
    }

    redisSerializationProtocol(): number {
        const version = this.configService.get<number>('REDIS_SERIALIZATION_PROTOCOL', 3);
        return Number(version);
    }

    redisEnableClientSideCache(): boolean {
        return toBoolean(this.configService.get('REDIS_ENABLE_CLIENT_SIDE_CACHE', false))
    }
}