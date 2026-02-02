export class OpenAIProvider extends ModelProvider {

  validateProviderCredentials(credentials: Record<string, any>): Promise<void> {
    throw new Error("Method not implemented.");
  }

}