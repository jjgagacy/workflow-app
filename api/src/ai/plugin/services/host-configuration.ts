import { HostedModeration, HostingProvider } from "@/ai/model_runtime/entities/hosting-provider";
import { GlobalLogger } from "@/logger/logger.service";
import { EditionType } from "@/monie/enums/version.enum";
import { MonieConfig } from "@/monie/monie.config";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { DEFAULT_PLUGIN_ID } from "../dtos/model-provider.dto";
import { QuotaUnit } from "@/ai/model_runtime/enums/quota.enum";
import { FreeHostingQuota, HostingQuota, PaidHostingQuota, TrialHostingQuota } from "@/ai/model_runtime/entities/hosting-quota.entity";
import { RestrictModel } from "@/ai/model_runtime/entities/configuration.entity";
import { ModelType } from "@/ai/model_runtime/enums/model-runtime.enum";
import { AnthropicCredentials, AzureOpenAICredentials, OpenAICredentials } from "@/ai/model_runtime/types/credentials.type";
import { AZURE_TRIAL_MODELS } from "@/monie/constants/default-hosted-value";

@Injectable()
export class HostConfiguration implements OnModuleInit {
  providerMap: Map<string, HostingProvider> = new Map();
  hostedModeration?: HostedModeration;

  constructor(
    private readonly monieConfig: MonieConfig,
    private readonly logger: GlobalLogger,
  ) { }

  async onModuleInit() {
    await this.initConfiguration();
  }

  private async initConfiguration(): Promise<void> {
    if (this.monieConfig.edition() !== EditionType.CLOUD) {
      this.logger.log('You are running in non-cloud edition, skipping hosting configuration initialization');
      return;
    }

    this.logger.log('initialization hosting configuration');

    // init providers
    this.providerMap.set(`${DEFAULT_PLUGIN_ID}/openai/openai`, this.initOpenAI());
    this.providerMap.set(`${DEFAULT_PLUGIN_ID}/azure_openai/azuore_openai`, this.initAzureOpenAI());
    this.providerMap.set(`${DEFAULT_PLUGIN_ID}/anthropic/anthropic`, this.initAnthropic());
    this.providerMap.set(`${DEFAULT_PLUGIN_ID}/minimax/minimax`, this.initMinimax());
    this.providerMap.set(`${DEFAULT_PLUGIN_ID}/spark/spark`, this.initSpark());
    this.providerMap.set(`${DEFAULT_PLUGIN_ID}/zhipu/zhipu`, this.initZhipu());

    this.hostedModeration = this.initHostedModeration();
  }

  private initOpenAI(): HostingProvider {
    const quotaUnit = QuotaUnit.CREDITS;
    const quotas: HostingQuota[] = [];

    if (this.monieConfig.openAITrialEnabled()) {
      const quotaLimit = this.monieConfig.openAIQuotaLimit();
      const restrictModels = this.parseRestrictModels(this.monieConfig.openAITrialModels());
      const trialQuota = new TrialHostingQuota(quotaLimit, restrictModels);
      quotas.push(trialQuota);
    }

    if (this.monieConfig.openAIPaidEnabled()) {
      const paidModels = this.parseRestrictModels(this.monieConfig.openAIPaidModels());
      const paidQuota = new PaidHostingQuota(paidModels);
      quotas.push(paidQuota);
    }

    if (quotas.length > 0) {
      const credentials: OpenAICredentials = {
        apiKey: this.monieConfig.openAIApiKey(),
        provider: "openai"
      };
      const apiBase = this.monieConfig.openAIApiBase();
      if (apiBase) {
        credentials.baseUrl = apiBase;
      }
      const organization = this.monieConfig.openAIOrganization();
      if (organization) {
        credentials.organizationId = organization;
      }

      return new HostingProvider({
        enabled: true,
        credentials,
        quotaUnit,
        quotas,
      });
    }

    return new HostingProvider({
      enabled: false,
      quotaUnit,
    });
  }

  private initAzureOpenAI(): HostingProvider {
    const quotaUnit = QuotaUnit.TIMES;

    if (this.monieConfig.azureOpenAIEnabled()) {
      const credentials: AzureOpenAICredentials = {
        apiKey: this.monieConfig.azureOpenAIApiKey(),
        baseUrl: this.monieConfig.azureOpenAIApiBase(),
        provider: 'azure_openai',
      };

      const quotas: HostingQuota[] = [];
      const quotaLimit: number = this.monieConfig.azureOpenAIQuotaLimit();

      const trialQuota = new TrialHostingQuota(quotaLimit, AZURE_TRIAL_MODELS);
      quotas.push(trialQuota);

      return new HostingProvider({
        enabled: true,
        credentials,
        quotas,
        quotaUnit,
      });
    }
    return new HostingProvider({
      enabled: false,
      quotaUnit,
    });
  }

  private initAnthropic(): HostingProvider {
    const quotaUnit = QuotaUnit.TOKENS;
    const quotas: HostingQuota[] = [];

    if (this.monieConfig.anthropicTrialEnabled()) {
      const quotaLimit = this.monieConfig.anthropicQuotaLimit();
      const trialQuota = new TrialHostingQuota(quotaLimit);
      quotas.push(trialQuota);
    }

    if (this.monieConfig.anthropicPaidEnabled()) {
      const paidQuota = new PaidHostingQuota();
      quotas.push(paidQuota);
    }

    if (quotas.length > 0) {
      const credentials: AnthropicCredentials = {
        apiKey: this.monieConfig.anthropicApiKey(),
        baseUrl: this.monieConfig.anthropicApiBase(),
        provider: 'anthropic',
      };

      return new HostingProvider({
        enabled: true,
        credentials,
        quotaUnit,
        quotas
      });
    }

    return new HostingProvider({
      enabled: false,
      quotaUnit,
    });
  }

  private initMinimax(): HostingProvider {
    const quotaUnit = QuotaUnit.TOKENS;

    if (this.monieConfig.minimaxEnabled()) {
      const quotas = [new FreeHostingQuota()];

      return new HostingProvider({
        enabled: true,
        credentials: undefined,
        quotaUnit,
        quotas,
      });
    }

    return new HostingProvider({
      enabled: false,
      quotaUnit,
    });
  }

  private initSpark(): HostingProvider {
    const quotaUnit = QuotaUnit.TOKENS;

    if (this.monieConfig.sparkEnabled()) {
      const quotas = [new FreeHostingQuota()];

      return new HostingProvider({
        enabled: true,
        credentials: undefined,
        quotaUnit,
        quotas,
      });
    }

    return new HostingProvider({
      enabled: false,
      quotaUnit,
    });
  }

  private initZhipu(): HostingProvider {
    const quotaUnit = QuotaUnit.TOKENS;

    if (this.monieConfig.zhipuAIEnabled()) {
      const quotas = [new FreeHostingQuota()];

      return new HostingProvider({
        enabled: true,
        credentials: undefined,
        quotaUnit,
        quotas,
      });
    }

    return new HostingProvider({
      enabled: false,
      quotaUnit,
    });
  }

  private initHostedModeration(): HostedModeration {
    if (this.monieConfig.moderationEnabled() && this.monieConfig.moderationProviders()) {
      const providers = this.monieConfig.moderationProviders().split(',');
      const hostedProviders: string[] = [];

      for (const provider of providers) {
        if (!provider.includes('/')) {
          hostedProviders.push(`${DEFAULT_PLUGIN_ID}/${provider}/${provider}`);
        } else {
          hostedProviders.push(provider);
        }
      }

      return new HostedModeration({
        enabled: true,
        providers,
      });
    }

    return new HostedModeration({
      enabled: false
    });
  }

  private parseRestrictModels(models: string): RestrictModel[] {
    const modelList = models ? models.split(',') : [];

    return modelList
      .map(modelName => modelName.trim())
      .filter(modelName => modelName)
      .map(modelName => new RestrictModel(modelName, ModelType.LLM));
  }

}
