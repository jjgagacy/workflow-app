import { IsOptional } from "class-validator";
import { ModelType } from "../enums/model-runtime.enum";

export class RestrictModel {
  model: string;

  modelType: ModelType;

  @IsOptional()
  baseModel?: string;
}

