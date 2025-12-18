import { StreamMessage } from "@/core/dtos/stream.dto";

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
