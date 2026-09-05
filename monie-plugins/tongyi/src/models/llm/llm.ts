import { AIModel, AssistantPromptMessage, LargeLanguageModel, LLMChunkResult, LLMResult, LLMUsage, PriceInfo, PriceType, PromptMessage, PromptMessageTool } from "monie-plugin";

export class TongyiLargeLanguageModel extends LargeLanguageModel {
  async invoke(
    model: string,
    credentials: Record<string, any>,
    promptMessages: PromptMessage[],
    modelParameters: Record<string, any>,
    tools?: PromptMessageTool[] | undefined,
    stop?: string[] | undefined,
    stream: boolean = true,
    user?: string | undefined,
  ): Promise<LLMResult | AsyncGenerator<LLMChunkResult>> {
    void credentials;
    void promptMessages;
    void modelParameters;
    void tools;
    void stop;
    void user;

    if (stream) {
      return this.mockStream(model);
    }

    return new LLMResult({
      model,
      message: new AssistantPromptMessage({ content: 'hello' }),
      usage: new LLMUsage({
        promptTokens: 1,
        completionTokens: 1,
        totalTokens: 2,
      }),
    });
  }

  private async *mockStream(model: string): AsyncGenerator<LLMChunkResult> {
    yield new LLMChunkResult({
      model,
      delta: {
        index: 0,
        message: new AssistantPromptMessage({ content: 'hello' }),
      },
    });
  }
  getNumTokens(model: string, credentials: Record<string, any>, promptMessages: PromptMessage[], tools: PromptMessageTool[] | undefined): Promise<number> {
    throw new Error("Method not implemented.");
  }
  getPrice(model: string, credentials: Record<string, any>, priceType: PriceType, tokens: number): PriceInfo {
    throw new Error("Method not implemented.");
  }
  getModelSchema(model: string, credentials?: Record<string, any>): Promise<AIModel | undefined> {
    throw new Error("Method not implemented.");
  }
  validateCredentials(model: string, credentials: Record<string, any>): Promise<void> {
    throw new Error("Method not implemented.");
  }
}