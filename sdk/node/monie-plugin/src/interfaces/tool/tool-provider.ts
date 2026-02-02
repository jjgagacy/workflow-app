import { ClassWithMarker } from "../marker.class.js";

export const TOOL_PROVIDER_SYMBOL = Symbol.for('plugin.tool.provider');

export abstract class ToolProvider {
  static [TOOL_PROVIDER_SYMBOL] = true;
  constructor() { }
  abstract validateCredentials(credentials: Record<string, any>): Promise<void>;
}

export type ToolProviderClassType = ClassWithMarker<ToolProvider, typeof TOOL_PROVIDER_SYMBOL>;
export function isToolProviderClass(cls: any): cls is ToolProviderClassType {
  return Boolean(cls?.[TOOL_PROVIDER_SYMBOL]);
}