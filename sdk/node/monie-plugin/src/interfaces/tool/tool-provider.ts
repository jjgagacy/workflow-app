export abstract class ToolProvider {
  constructor() { }

  abstract validateCredentials(credentials: Record<string, any>): Promise<void>;
}
