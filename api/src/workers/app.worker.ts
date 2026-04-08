import { NestFactory } from "@nestjs/core";
import { PingService } from "./services/ping.service";
import { WorkerModule } from "./worker.module";
import { TaskData, WorkerData, WorkerResult } from "@/tasks/task.type";
import { ThreadWorker } from "poolifier";
import { INestApplicationContext } from "@nestjs/common";

class AppRequestHandlerWorker<
  Data extends WorkerData<TaskData>,
  Response extends WorkerResult<TaskData>
> extends ThreadWorker<Data, Response> {
  private app!: INestApplicationContext;
  public constructor() {
    super({
      echo: (workerData?: Data) => {
        return workerData as unknown as Response
      }
    });
    this.initNestApp();
    this.addTaskFunction('ping', this.ping.bind(this));
  }

  private async initNestApp() {
    this.app = await NestFactory.createApplicationContext(WorkerModule);
    console.log("======== init worker thread app ============");
  }

  private async ping(workerData?: Data): Promise<Response> {
    const service = this.app.get(PingService);
    try {
      const result = await service.ping(workerData);

      return { success: true, result } as unknown as Response
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error' } as unknown as Response
    }
  }
}

export const requestHandlerWorker = new AppRequestHandlerWorker<
  WorkerData<TaskData>,
  WorkerResult<TaskData>
>()