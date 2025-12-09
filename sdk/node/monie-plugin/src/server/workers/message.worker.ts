import { ThreadWorker } from "poolifier";
import { TaskData, TaskResult } from "./worker.type";

class MessageWorker extends ThreadWorker<TaskData, TaskResult> {
  constructor() {
    super(async (task?: TaskData) => {
      if (!task) {
        return {
          success: false,
          error: 'no task',
        }
      }

      try {
        // 模拟耗时逻辑
        console.log('processing payload:', task.payload);
        await new Promise((r) => setTimeout(r, 50));

        const result: TaskResult = {
          success: true,
          processedAt: Date.now()
        };

        return result;
      } catch (error: any) {
        return {
          success: false,
          error: error?.message ?? "Unknown error",
        }
      }
    });
  }
}

export default new MessageWorker();
