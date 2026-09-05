import { ModelProvider } from "monie-plugin";

export class TongyiProvider extends ModelProvider {
  async validateProviderCredentials(credentials: Record<string, any>): Promise<void> {
    const apiKey = credentials.apiKey || credentials.api_key;
    if (typeof apiKey !== 'string' || apiKey.trim() === '') {
      throw new Error('Tongyi API key is required.');
    }
  }
}