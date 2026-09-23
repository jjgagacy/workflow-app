import { MapUtils } from "@/common/utils/map";
import { ModelType } from "../enums/model-runtime.enum";

export class ModelTypeUtil {
  private static readonly MODEL_TYPE_MAP = new Map<ModelType, string>([
    [ModelType.llm, 'text-generation'],
    [ModelType.text_embedding, 'embeddings'],
    [ModelType.rerank, 'reranking'],
    [ModelType.speech2text, 'speech2text'],
    [ModelType.tts, 'tts'],
    [ModelType.moderation, 'moderation'],
  ]);

  private static readonly REVERSE_MODEL_TYPE_MAP: Record<string, ModelType> = (() => {
    const reverseMap: Record<string, ModelType> = {};

    MapUtils.map(this.MODEL_TYPE_MAP, function (value: string, key: ModelType) {
      reverseMap[value] = key;
    })

    return reverseMap;
  })();

  static valueOf(origin: string): ModelType {
    const modelType = this.REVERSE_MODEL_TYPE_MAP[origin];
    if (!modelType) {
      throw new Error(`Invalid origin model type: ${origin}`);
    }
    return modelType;
  }

  static toValue(modelType: ModelType): string {
    const value = this.MODEL_TYPE_MAP.get(modelType);
    if (!value) {
      throw new Error(`Invalid model type: ${modelType}`);
    }
    return value;
  }
}
