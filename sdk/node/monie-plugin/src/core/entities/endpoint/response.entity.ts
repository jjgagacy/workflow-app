import { BlobInvokeMessage } from "@/core/dtos/invoke-message.dto";
import { BlobChunkMessage, JsonMessage, TextMessage } from "@/core/dtos/message.dto";

export type ResponseMessage =
  | BlobInvokeMessage
  | BlobChunkMessage
  | TextMessage
  | JsonMessage;

export type GeneratorResponse<T = ResponseMessage> =
  | Generator<T>
  | AsyncGenerator<T>
  | Iterable<T>
  | AsyncIterable<T>

export type Response<T = ResponseMessage> =
  | T
  | GeneratorResponse<T>;
