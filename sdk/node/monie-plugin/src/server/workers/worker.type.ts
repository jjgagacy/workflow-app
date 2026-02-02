import { StreamMessage } from "@/core/dtos/stream.dto.js";

export interface TaskData {
  messageId: string;
  payload: StreamMessage;
}

export interface TaskResult {
  success: boolean;
  workerId?: number;
  processedAt?: number;
  error?: string;
}
