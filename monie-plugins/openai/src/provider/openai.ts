import { ModelProvider } from "monie-plugin";

export class OpenAIProvider extends ModelProvider {
  async validateProviderCredentials(credentials: Record<string, any>): Promise<void> {
    const apiKey = credentials.apiKey || credentials.api_key;
    if (typeof apiKey !== 'string' || apiKey.trim() === '') {
      throw new Error('OpenAI API key is required.');
    }
  }
}