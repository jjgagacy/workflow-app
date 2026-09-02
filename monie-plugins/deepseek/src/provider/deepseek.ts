import { ModelProvider } from "monie-plugin";

export class DeepseekProvider extends ModelProvider {
  async validateProviderCredentials(credentials: Record<string, any>): Promise<void> {
    const apiKey = credentials.apiKey || credentials.api_key;
    if (typeof apiKey !== 'string' || apiKey.trim() === '') {
      throw new Error('DeepSeek API key is required.');
    }
  }
}