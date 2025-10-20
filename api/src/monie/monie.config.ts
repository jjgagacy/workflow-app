import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EnterpriseConfig } from "./config/enterprise.config";
import { applyMixins } from "@/common/utils/mixins";
import { DeploymentConfig } from "./config/deployment.config";
import { RedisConfig } from "./config/redis.config";
import { AccountConfig } from "./config/account.config";
import { AppExecutionConfig } from "./config/app-execution.config";
import { CodeExecutionConfig } from "./config/code-execution.config";
import { EndPointConfig } from "./config/endpoint.config";
import { FileUploadConfig } from "./config/fileupload.config";
import { HttpRequestConfig } from "./config/http-request.config";
import { InnerApiConfig } from "./config/inner-api.config";
import { LoggingConfig } from "./config/logging.config";
import { PluginConfig } from "./config/plugin.config";
import { SecurityConfig } from "./config/security.config";
import { BillingConfig } from "./config/billing.config";
import { LoginConfig } from "./config/login.config";

@Injectable()
export class MonieConfig {
    constructor(protected readonly configService: ConfigService
    ) { }
}

// In TypeScript, when a class and interface have the same name, it doesn't
// cause a complilation error due to a feature called Declaration Merging.
export interface MonieConfig extends
    AccountConfig,
    AppExecutionConfig,
    BillingConfig,
    CodeExecutionConfig,
    DeploymentConfig,
    EndPointConfig,
    EnterpriseConfig,
    FileUploadConfig,
    HttpRequestConfig,
    InnerApiConfig,
    LoggingConfig,
    LoginConfig,
    PluginConfig,
    RedisConfig,
    SecurityConfig { }

applyMixins(MonieConfig, [
    AccountConfig,
    AppExecutionConfig,
    BillingConfig,
    CodeExecutionConfig,
    DeploymentConfig,
    EndPointConfig,
    EnterpriseConfig,
    FileUploadConfig,
    HttpRequestConfig,
    InnerApiConfig,
    LoggingConfig,
    LoginConfig,
    PluginConfig,
    RedisConfig,
    SecurityConfig
])
