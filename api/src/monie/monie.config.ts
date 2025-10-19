import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EnterpriseConfig } from "./config/enterprise.config";
import { applyMixins } from "@/common/utils/mixins";
import { DeploymentConfig } from "./config/deplyment.config";
import { RedisConfig } from "./config/redis.config";

@Injectable()
export class MonieConfig {
    constructor(protected readonly configService: ConfigService
    ) { }
}

// In TypeScript, when a class and interface have the same name, it doesn't
// cause a complilation error due to a feature called Declaration Merging.
export interface MonieConfig extends
    EnterpriseConfig,
    DeploymentConfig,
    RedisConfig { }

applyMixins(MonieConfig, [
    EnterpriseConfig,
    DeploymentConfig,
    RedisConfig,
])
