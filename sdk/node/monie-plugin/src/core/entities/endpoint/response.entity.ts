import { ToolInvokeMessage } from "@/interfaces/tool/invoke-message.js";

export type ResponseMessage = ToolInvokeMessage

export type GeneratorResponse<T = ResponseMessage> =
  | Generator<T>
  | AsyncGenerator<T>
  | Iterable<T>
  | AsyncIterable<T>

export type Response<T = ResponseMessage> =
  | T
  | GeneratorResponse<T>;
