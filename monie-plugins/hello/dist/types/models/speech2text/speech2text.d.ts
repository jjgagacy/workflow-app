import { AudioFile, Speech2TextOptions } from "@/core/entities/model/speech2text.entity";
import { AIModel } from "@/core/entities/plugin/ai-model";
import { Speech2TextModel } from "@/interfaces/model/speech2text.model";
export declare class OpenAISpeech2TextModel extends Speech2TextModel {
    invoke(model: string, credentials: Record<string, any>, file: AudioFile, user?: string | null, options?: Speech2TextOptions): Promise<string> | string;
    getModelSchema(model: string, credentials?: Record<string, any>): Promise<AIModel | undefined>;
    validateCredentials(model: string, credentials: Record<string, any>): Promise<void>;
}
//# sourceMappingURL=speech2text.d.ts.map