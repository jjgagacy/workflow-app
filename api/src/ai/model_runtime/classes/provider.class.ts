import { IsOptional } from "class-validator";
import { I18nObject } from "./model-runtime.class";
import { ModelType } from "../enums/model-runtime.enum";
import { AIModel } from "./ai-model.class";

export class ProviderConfig {
    provider: string;
    credentials: Record<string, any>;
}

export class ProviderHelp {
    title: I18nObject;
    url: I18nObject;
}

export class Provider {
    provider: string;
    label: I18nObject;
    @IsOptional()
    description?: I18nObject;
    @IsOptional()
    iconSmall?: I18nObject;
    @IsOptional()
    iconLarge?: I18nObject;
    @IsOptional()
    iconLargeDark?: I18nObject;
    @IsOptional()
    background?: string;
    @IsOptional()
    help?: ProviderHelp;
    supportedModelTypes: ModelType[];

    models: AIModel[];

    @IsOptional()
    position?: Record<string, string[]>;

    static validateModels(models: any): AIModel[] {
        if (!Array.isArray(models)) {
            return [];
        }
        if (!models || models.length === 0) {
            return [];
        }
        return models as AIModel[];
    }

    toSimpleProvider(): SimpleProvider {
        return new SimpleProvider(this);
    }
}


export class SimpleProvider {
    provider: string;
    label: I18nObject;
    @IsOptional()
    iconSmall?: I18nObject;
    @IsOptional()
    iconLarge?: I18nObject;
    supportedModelTypes: ModelType[];

    models: AIModel[];

    constructor(providerObj?: Provider) {
        if (providerObj) {
            const { provider, label, iconSmall, iconLarge, supportedModelTypes } = providerObj;
            Object.assign(this, { provider, label, iconSmall, iconLarge, supportedModelTypes });
        }
    }
}