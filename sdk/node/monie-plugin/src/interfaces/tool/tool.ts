import { ToolLike } from "./tool-like";
import { ToolInvokeMessage } from "./invoke-message";
import { Session } from "@/core/classes/runtime";
import { ToolParameter } from "@/core/entities/plugin/declaration/tool";
import { ClassWithMarker } from "../marker.class";

export class ToolRuntime {
  constructor(
    public credentials: Record<string, any>,
    public credentialType?: string,
    public userId?: string,
    public sessionId?: string,
  ) { }
}

export const TOOL_SYMBOL = Symbol.for('plugin.tool');

export abstract class Tool extends ToolLike<ToolInvokeMessage> {
  static [TOOL_SYMBOL] = true;
  runtime: ToolRuntime;
  session: Session;

  constructor(runtime: ToolRuntime, session: Session) {
    super();
    this.responseType = ToolInvokeMessage;
    this.runtime = runtime;
    this.session = session;
  }

  abstract invoke(toolParameters: Record<string, any>):
    AsyncGenerator<ToolInvokeMessage> |
    Iterable<ToolInvokeMessage> |
    Promise<ToolInvokeMessage>;

  validateCredentials(credentials: Record<string, any>): void { }

  abstract getRuntimeParameters(): Promise<ToolParameter[]>;
}

export type ToolClassType = ClassWithMarker<Tool, typeof TOOL_SYMBOL>;
export function isToolClass(cls: any): cls is ToolClassType {
  return Boolean(cls?.[TOOL_SYMBOL]);
}
