import { Injectable, OnApplicationBootstrap, OnApplicationShutdown } from "@nestjs/common";
import { DynamicThreadPool, FixedThreadPool, PoolEvents } from "poolifier";
import { TaskData, WorkerData, WorkerResult } from "./task.type";
import { join } from "path";
import { ConfigService } from "@nestjs/config";
import * as os from "os";

@Injectable()
export class TaskService implements OnApplicationBootstrap, OnApplicationShutdown {
  private pool!: FixedThreadPool<WorkerData<TaskData>, WorkerResult<TaskData>> | DynamicThreadPool<WorkerData<TaskData>, WorkerResult<TaskData>>;
  private minWorkers: number = 2;
  private maxWorkers: number = Math.max(2, Math.floor(os.cpus().length / 2));
  private workerPath = join(process.cwd(), './dist/src/workers/app.worker.js');

  constructor(private configService: ConfigService) {
    this.initializePool();
  }

  onApplicationBootstrap() {
    // Initialization logic here
  }

  onApplicationShutdown() {
    this.pool.destroy();
  }

  private initializePool() {
    const useDynamicPool = this.configService.get<string>("USE_DYNAMIC_POOL") === 'true';

    const onlineHandler = () => {
      console.log(`Worker is online`);
    };

    const exitHandler = () => {
      console.log(`Worker exited with code `);
    }

    const errorHandler = (err: Error) => {
      console.error('Worker error:', err);
    }

    const messageHandler = () => {
      console.log('Message from worker:');
    }

    const poolOptions = {
      enableEvents: true,
      enableTasksQueue: true,
      onlineHandler,
      messageHandler,
      errorHandler,
      exitHandler,
    };

    if (useDynamicPool) {
      this.pool = new DynamicThreadPool<WorkerData<TaskData>, WorkerResult<TaskData>>(
        this.minWorkers,
        this.maxWorkers,
        this.workerPath,
        poolOptions
      );
    } else {
      this.pool = new FixedThreadPool(this.maxWorkers, this.workerPath, poolOptions);
    }

    if (this.pool.emitter) {
      this.pool.emitter.on(PoolEvents.ready, () => {
        console.log(`Pool is ready with ${this.pool.workerNodes.length} workers`);
      });

      this.pool.emitter.on(PoolEvents.busy, () => {
        console.log('Pool is busy');
      });
    }
  }

  getStats() {
    return {
      workers: this.pool.workerNodes.length,
    };
  }

  async executeTask(taskData: any, name?: string): Promise<any> {
    return this.pool.execute(taskData, name);
  }
}