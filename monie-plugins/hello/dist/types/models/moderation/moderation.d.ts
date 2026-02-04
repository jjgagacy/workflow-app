import { AIModel, ModerationModel } from "monie-plugin";
export declare class OpenAIModerationModel extends ModerationModel {
    getModelSchema(model: string, credentials?: Record<string, any>): Promise<AIModel | undefined>;
    validateCredentials(model: string, credentials: Record<string, any>): Promise<void>;
}
//# sourceMappingURL=moderation.d.ts.map