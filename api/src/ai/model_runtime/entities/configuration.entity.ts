import { IsOptional } from "class-validator";
import { ModelType } from "../enums/model-runtime.enum";

export class RestrictModel {
  constructor(
    public model: string,
    public modelType: ModelType,
    public baseModel?: string,
  ) { }
}

