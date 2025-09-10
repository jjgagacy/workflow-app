import { IsOptional} from "class-validator";
import { I18nObject } from "./model-runtime.class";
import { ModelType } from "../enums/model-runtime.enum";
import { Provider } from "./provider.class";
import { AIModel } from "./ai-model.class";

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