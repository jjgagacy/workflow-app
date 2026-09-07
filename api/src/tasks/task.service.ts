import { Injectable, OnApplicationBootstrap, OnApplicationShutdown } from "@nestjs/common";
import { DynamicThreadPool, FixedThreadPool, PoolEvents } from "poolifier";
import { TaskData, WorkerData, WorkerResult } from "./task.type";
import { existsSync } from "fs";
import { join } from "path";
import { ConfigService } from "@nestjs/config";
import * as os from "os";

@Injectable()
export class TaskService implements OnApplicationBootstrap, OnApplicationShutdown {
  private pool!: FixedThreadPool<WorkerData<TaskData>, WorkerResult<TaskData>> | DynamicThreadPool<WorkerData<TaskData>, WorkerResult<TaskData>>;
  private minWorkers: number = 2;
  private maxWorkers: number = Math.max(2, Math.floor(os.cpus().length / 2));
  private workerPath: string;
  private workerExecArgv: string[] | undefined;

  constructor(private configService: ConfigService) {
    const compiledWorkerPath = join(__dirname, '../workers/app.worker.js');
    const sourceWorkerPath = join(__dirname, '../workers/app.worker.ts');

    if (existsSync(compiledWorkerPath)) {
      this.workerPath = compiledWorkerPath;
    } else if (existsSync(sourceWorkerPath)) {
      this.workerPath = sourceWorkerPath;
      this.workerExecArgv = [
        '-r',
        require.resolve('ts-node/register'),
        '-r',
        require.resolve('tsconfig-paths/register'),
      ];
    } else {
      throw new Error(`Unable to find task worker at ${compiledWorkerPath} or ${sourceWorkerPath}`);
    }

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
      // console.log(`Worker is online`);
    };

    const exitHandler = () => {
      // console.log(`Worker exited with code `);
    }

    const errorHandler = (err: Error) => {
      // console.error('Worker error:', err);
    }

    const messageHandler = () => {
      // console.log('Message from worker:');
    }

    const poolOptions = {
      enableEvents: true,
      enableTasksQueue: true,
      onlineHandler,
      messageHandler,
      errorHandler,
      exitHandler,
      workerOptions: this.workerExecArgv ? { execArgv: this.workerExecArgv } : undefined,
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