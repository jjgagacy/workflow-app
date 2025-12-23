export abstract class DynamicSelect {
  fetchParameterOptions(parameter: string): Promise<any[]> {
    throw new Error(`Not impl`);
  }
}
