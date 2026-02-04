import { AIModel, AssistantPromptMessage, LargeLanguageModel, LLMChunkResult, LLMMode, LLMResult, LLMUsage, PriceInfo, PriceType, PromptMessage, PromptMessageTool } from "monie-plugin";
import { toCredentialsOptions } from "../common";
import OpenAI from "openai";
import { encodingForModel } from "js-tiktoken";

function getModelMode(model: string): LLMMode {
  if (model.startsWith('gpt-')) return LLMMode.CHAT;
  return LLMMode.COMPLETION;
}

export class OpenAILargeLanguageModel extends LargeLanguageModel {
  async invoke(
    model: string,
    credentials: Record<string, any>,
    promptMessages: PromptMessage[],
    modelParameters: Record<string, any>,
    tools?: PromptMessageTool[] | undefined,
    stop?: string[] | undefined,
    stream?: boolean,
    user?: string | undefined
  ): Promise<LLMResult | AsyncGenerator<LLMChunkResult>> {
    const baseModel = model.startsWith(':') ? model.split(':')[1] : model;
    const mode = getModelMode(baseModel || '');
    // console.log('invoke params:', { model, credentials, promptMessages, modelParameters, tools, stop, stream, user });
    console.log(mode === LLMMode.CHAT);
    return mode === LLMMode.CHAT
      ? this.chatGenerate(
        model,
        credentials,
        promptMessages,
        modelParameters,
        tools,
        stop,
        stream,
        user
      )
      : this.generate(
        model,
        credentials,
        promptMessages,
        modelParameters,
        stop,
        stream,
        user
      );
  }

  private async generate(
    model: string,
    credentials: any,
    promptMessages: PromptMessage[],
    modelParameters: any,
    stop?: string[],
    stream: boolean = true,
    user?: string
  ): Promise<LLMResult | AsyncGenerator<LLMChunkResult>> {
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

  protected async *handleCompletionStream(
    model: string,
    response: any,
    promptMessage: string,
  ): AsyncGenerator<LLMChunkResult> {
    throw new Error('Method not implementation');
  }

  private async chatGenerate(
    model: string,
    credentials: any,
    promptMessages: PromptMessage[],
    modelParameters: any,
    tools?: any[],
    stop?: string[],
    stream: boolean = true,
    user?: string
  ): Promise<LLMResult | AsyncGenerator<LLMChunkResult>> {
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

  getNumTokens(model: string, credentials: Record<string, any>, promptMessages: PromptMessage[], tools: PromptMessageTool[] | undefined): Promise<number> {
    const enc = encodingForModel(model as any);
    let tokenCount = 0;
    promptMessages.forEach(msg => {
      tokenCount += enc.encode(msg.content).length;
    });
    return Promise.resolve(tokenCount);
  }

  getPrice(model: string, credentials: Record<string, any>, priceType: PriceType, tokens: number): PriceInfo {
    const prices: Record<string, Record<PriceType, number>> = {
      "gpt-4": { input: 0.03, output: 0.06 },
      "gpt-4-turbo": { input: 0.01, output: 0.03 },
      "gpt-3.5-turbo": { input: 0.0005, output: 0.0015 },
    };
    throw new Error("Method not implemented.");
  }

  async getModelSchema(model: string, credentials?: Record<string, any>): Promise<AIModel | undefined> {
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

  validateCredentials(model: string, credentials: Record<string, any>): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
