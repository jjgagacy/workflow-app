import { AIModel } from "@/core/entities/plugin/ai-model";
import { ModerationModel } from "@/interfaces/model/moderation.model";
export declare class OpenAIModerationModel extends ModerationModel {
    getModelSchema(model: string, credentials?: Record<string, any>): Promise<AIModel | undefined>;
    validateCredentials(model: string, credentials: Record<string, any>): Promise<void>;
}
//# sourceMappingURL=moderation.d.ts.map