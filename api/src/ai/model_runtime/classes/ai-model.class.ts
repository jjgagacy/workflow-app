import { IsOptional } from "class-validator";
import { ProviderModel } from "./provider-model.class";
import { PriceConfig } from "./model-runtime.class";
import { ModelFeature } from "../enums/model-runtime.enum";

export class AIModel extends ProviderModel {
    @IsOptional()
    pricing?: PriceConfig;

    constructor() {
        super();
        this.validateModel();
    }

    private validateModel(): void {
        if (!this.features) {
            this.features = [ModelFeature.STRUCTURED_OUTPUT];
        } else {
            this.features.push(ModelFeature.STRUCTURED_OUTPUT);
        }
    }
}