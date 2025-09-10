import { Injectable } from "@nestjs/common";
import { ModelType } from "./enums/model-runtime.enum";
import { ModelTypeUtil } from "./utils/model-type.util";

@Injectable()
export class ModelTypeService {
    getModelTypeFromValue(modelType: string): ModelType {
        return ModelTypeUtil.valueOf(modelType);
    }

    getModelTypeValue(modelType: ModelType): string {
        return ModelTypeUtil.toValue(modelType);
    }

}