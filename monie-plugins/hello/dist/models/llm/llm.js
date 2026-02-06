import { AssistantPromptMessage, LargeLanguageModel, LLMMode, LLMResult, LLMUsage } from "monie-plugin";
import { toCredentialsOptions } from "../common.js";
import OpenAI from "openai";
import { encodingForModel } from "js-tiktoken";
function getModelMode(model) {
    if (model.startsWith('gpt-'))
        return LLMMode.CHAT;
    return LLMMode.COMPLETION;
}
export class OpenAILargeLanguageModel extends LargeLanguageModel {
    async invoke(model, credentials, promptMessages, modelParameters, tools, stop, stream, user) {
        const baseModel = model.startsWith(':') ? model.split(':')[1] : model;
        const mode = getModelMode(baseModel || '');
        // console.log('invoke params:', { model, credentials, promptMessages, modelParameters, tools, stop, stream, user });
        console.log(mode === LLMMode.CHAT);
        return mode === LLMMode.CHAT
            ? this.chatGenerate(model, credentials, promptMessages, modelParameters, tools, stop, stream, user)
            : this.generate(model, credentials, promptMessages, modelParameters, stop, stream, user);
    }
    async generate(model, credentials, promptMessages, modelParameters, stop, stream = true, user) {
        const client = new OpenAI(toCredentialsOptions(credentials));
        const prompt = String(promptMessages[0]?.content);
        const res = await client.completions.create({
            model,
            prompt,
            stream,
            stop,
            user,
            ...modelParameters,
        });
        if (!stream) {
            const text = res.choices[0]?.text ?? "";
            return new LLMResult({
                model: res.model,
                message: new AssistantPromptMessage({ content: text }),
                usage: new LLMUsage({
                    promptTokens: res.usage?.prompt_tokens ?? 0,
                    completionTokens: res.usage?.completion_tokens ?? 0,
                    totalTokens: res.usage?.total_tokens ?? 0,
                }),
                systemFingerprint: res.system_fingerprint || '',
            });
        }
        return this.handleCompletionStream(model, res, prompt);
    }
    async *handleCompletionStream(model, response, promptMessage) {
        throw new Error('Method not implementation');
    }
    async chatGenerate(model, credentials, promptMessages, modelParameters, tools, stop, stream = true, user) {
        const client = new OpenAI(toCredentialsOptions(credentials));
        const prompt = promptMessages.map(m => m.content);
        console.log('OpenAI chatGenerate parameters: ', { model, prompt, stream, stop, user, modelParameters, options: toCredentialsOptions(credentials) });
        const res = await client.responses.create({
            model,
            input: prompt.join(','),
            stream,
            // stop,
            user,
            ...modelParameters,
        });
        console.log('OpenAI chatGenerate create response: ', res);
        if (!stream) {
            const text = res.id;
            return new LLMResult({
                model: res.model,
                message: new AssistantPromptMessage({ content: text }),
                usage: new LLMUsage({
                    promptTokens: res.usage?.input_tokens ?? 0,
                    completionTokens: res.usage?.output_tokens ?? 0,
                    totalTokens: res.usage?.total_tokens ?? 0,
                }),
            });
        }
        return this.handleCompletionStream(model, res, prompt[0] || '');
    }
    getNumTokens(model, credentials, promptMessages, tools) {
        const enc = encodingForModel(model);
        let tokenCount = 0;
        promptMessages.forEach(msg => {
            tokenCount += enc.encode(msg.content).length;
        });
        return Promise.resolve(tokenCount);
    }
    getPrice(model, credentials, priceType, tokens) {
        const prices = {
            "gpt-4": { input: 0.03, output: 0.06 },
            "gpt-4-turbo": { input: 0.01, output: 0.03 },
            "gpt-3.5-turbo": { input: 0.0005, output: 0.0015 },
        };
        throw new Error("Method not implemented.");
    }
    async getModelSchema(model, credentials) {
        if (!credentials?.apiKey) {
            throw new Error("OpenAI API key is required");
        }
        // Validate model exists in OpenAI's available models
        const validModels = ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"];
        if (!validModels.includes(model)) {
            return undefined;
        }
        return undefined;
    }
    validateCredentials(model, credentials) {
        throw new Error("Method not implemented.");
    }
}
//# sourceMappingURL=llm.js.map