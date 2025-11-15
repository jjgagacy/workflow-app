import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { toBoolean } from "../helpers/to-boolean";
import { getSafeNumber } from "../helpers/safe-number";
import { OPENAI_PAIED_MODELS, OPENAI_TRIAL_MODELS } from "../constants/default-hosted-value";

@Injectable()
export class ModelCreditService {
  private readonly creditMap: Map<string, number>;

  constructor(protected readonly configService: ConfigService) {
    const hostedModelCreditConfig = this.configService.get<string>(
      'HOSTED_MODEL_CREDIT_CONIFG',
      ''
    );

    this.creditMap = this.parseCreditConfig(hostedModelCreditConfig);
  }

  private parseCreditConfig(configString: string): Map<string, number> {
    const creditMap = new Map<string, number>();

    configString
      .split(',')
      .map(item => item.trim())
      .filter(item => item.includes(':'))
      .forEach(item => {
        const [model, credit] = item.split(';', 2);
        if (model && credit) {
          creditMap.set(model.trim(), parseInt(credit.trim(), 10));
        }
      });
    return creditMap;
  }

  getCreditForModel(modelName: string): number | undefined {
    return this.creditMap.get(modelName);
  }

  getAllModels(): string[] {
    return Array.from(this.creditMap.keys());
  }

  getCreditMap(): Map<string, number> {
    return new Map(this.creditMap);
  }

  getCreditConfig(): Record<string, number> {
    return Object.fromEntries(this.creditMap);
  }
}

@Injectable()
export class HostedOpenAIConfig {
  constructor(protected readonly configService: ConfigService) { }

  openAIApiKey(): string {
    return this.configService.get<string>('HOSTED_OPENAI_API_KEY', '');
  }

  openAIApiBase(): string {
    return this.configService.get<string>('HOSTED_OPENAI_API_BASE', '');
  }

  openAIOrganization(): string {
    return this.configService.get<string>('HOSTED_OPENAI_ORGANIZATION', '');
  }

  openAITrialEnabled(): boolean {
    return toBoolean(this.configService.get('HOSTED_OPENAI_TRIAL_ENABLED'));
  }

  openAITrialModels(): string {
    return this.configService.get<string>('HOSTED_OPENAI_TRIAL_MODELS', OPENAI_TRIAL_MODELS);
  }

  openAIQuotaLimit(): number {
    const quotaLimit = this.configService.get<number>('HOSTED_OPENAI_QUOTA_LIMIT');
    return getSafeNumber(quotaLimit, 200);
  }

  openAIPaidEnabled(): boolean {
    return toBoolean(this.configService.get('HOSTED_OPENAI_PAID_ENABLED'));
  }

  openAIPaidModels(): string {
    return this.configService.get<string>('HOSTED_OPENAI_PAIED_MODELS', OPENAI_PAIED_MODELS);
  }
}

@Injectable()
export class HostedAzureOpenAIConfig {
  constructor(protected readonly configService: ConfigService) { }

  azureOpenAIEnabled(): boolean {
    return toBoolean(this.configService.get('HOSTED_AZURE_OPENAI_ENABLED'));
  }

  azureOpenAIApiKey(): string {
    return this.configService.get<string>('HOSTED_AZURE_OPENAI_API_KEY', '');
  }

  azureOpenAIApiBase(): string {
    return this.configService.get<string>('HOSTED_AZURE_OPENAI_API_BASE', '');
  }

  azureOpenAIQuotaLimit(): number {
    const quotaLimit = this.configService.get<number>('HOSTED_AZURE_OPENAI_QUOTA_LIMIT');
    return getSafeNumber(quotaLimit, 200);
  }
}

@Injectable()
export class HostedAnthropicConfig {
  constructor(protected readonly configService: ConfigService) { }

  anthropicTrialEnabled(): boolean {
    return toBoolean(this.configService.get('HOSTED_ANTHROPIC_TRIAL_ENABLED'));
  }

  anthropicPaidEnabled(): boolean {
    return toBoolean(this.configService.get('HOSTED_ANTHROPIC_PAID_ENABLED'));
  }

  anthropicApiKey(): string {
    return this.configService.get<string>('HOSTED_ANTHROPIC_API_KEY', '');
  }

  anthropicApiBase(): string {
    return this.configService.get<string>('HOSTED_ANTHROPIC_API_BASE', '');
  }

  anthropicQuotaLimit(): number {
    const quotaLimit = this.configService.get<number>('HOSTED_ANTHROPIC_QUOTA_LIMIT');
    return getSafeNumber(quotaLimit, 200);
  }
}

@Injectable()
export class HostedMiniMaxConfig {
  constructor(protected readonly configService: ConfigService) { }

  minimaxEnabled(): boolean {
    return toBoolean(this.configService.get('HOSTED_MINIMAX_ENABLED'));
  }
}

@Injectable()
export class HostedSparkConfig {
  constructor(protected readonly configService: ConfigService) { }

  sparkEnabled(): boolean {
    return toBoolean(this.configService.get('HOSTED_SPARK_ENABLED'));
  }
}

@Injectable()
export class HostedZhipuAIConfig {
  constructor(protected readonly configService: ConfigService) { }

  zhipuAIEnabled(): boolean {
    return toBoolean(this.configService.get('HOSTED_ZHIPU_AI_ENABLED'));
  }
}

@Injectable()
export class HostedModerationConfig {
  constructor(protected readonly configService: ConfigService) { }

  moderationEnabled(): boolean {
    return toBoolean(this.configService.get('HOSTED_MODERATION_ENABLED'));
  }

  moderationProviders(): string {
    return this.configService.get<string>('HOSTED_MODERATION_PROVIDERS', '');
  }
}
