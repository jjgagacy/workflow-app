import { AIModel, AudioFile, Speech2TextModel, Speech2TextOptions } from "monie-plugin";
export declare class OpenAISpeech2TextModel extends Speech2TextModel {
    invoke(model: string, credentials: Record<string, any>, file: AudioFile, user?: string | null, options?: Speech2TextOptions): Promise<string> | string;
    getModelSchema(model: string, credentials?: Record<string, any>): Promise<AIModel | undefined>;
    validateCredentials(model: string, credentials: Record<string, any>): Promise<void>;
}
//# sourceMappingURL=speech2text.d.ts.map