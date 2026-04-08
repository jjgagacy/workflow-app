import { ConfigService } from "@nestjs/config";

export const BullConfig = (config: ConfigService) => ({
  redis: {
    host: config.get<string>('REDIS_HOST', 'localhost'),
    port: config.get<number>('REDIS_PORT', 6379),
  },
  prefix: 'queue',
  // 其他全局设置
  defaultJobOptions: {
    removeOnComplete: 100, // 保留最近100个完成的任务
    removeOnFail: 100,     // 保留最近100个失败的任务
    attempts: 3,           // 默认重试3次
    backoff: {             // 重试策略
      type: 'exponential',
      delay: 1000,
    },
  },
  // 连接设置
  settings: {
    lockDuration: 30000,   // 任务锁持续时间(ms)
    stalledInterval: 30000, // 检查卡住任务的间隔
    maxStalledCount: 1,    // 最大卡住次数
  }
});