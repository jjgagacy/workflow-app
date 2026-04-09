export interface ModelConfig {
  provider: string;
  model: string;
  mode: string;
  completionParams: Record<string, string>;
}

export interface AppModelConfig {
  model: ModelConfig;
  userInputForm?: string; // JSON string
  prePrompt?: string;
}

export interface AppConfig {
  mode: string;
  enableSite: boolean;
  enableApi: boolean;
}

export interface AppTemplate {
  app: AppConfig;
  modelConfig?: AppModelConfig;
}

export type DefaultAppTemplate = {
  readonly [key: string]: Readonly<AppTemplate>;
};

