import { ConfigService } from "@nestjs/config";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";

export const TypeOrmConfig = (config: ConfigService, isWorker: boolean = false) => {
  // 如果是 worker 线程，将连接池限制为 1 或 2；如果是主应用，则使用配置项的值
  const maxPoolSize = isWorker ? 2 : config.get<number>('POSTGRES_POOL_SIZE', 10);
  const maxConnectionLimit = isWorker ? 2 : config.get<number>('POSTGRES_CONNECTION_LIMIT', 10);
  return {
    type: config.get<'mysql' | 'postgres' | 'mongodb'>('DB_TYPE', 'postgres'),
    host: config.get<string>('POSTGRES_HOST', ''),
    port: config.get<number>('POSTGRES_PORT', 5432), //
    username: config.get<string>('POSTGRES_USERNAME', ''),
    password: config.get<string>('POSTGRES_PASSWORD', ''),
    database: config.get<string>('POSTGRES_DATABASE', ''),
    synchronize: process.env.NODE_ENV !== 'production', // development only
    autoLoadEntities: true,
    namingStrategy: new SnakeNamingStrategy(),
    poolSize: maxPoolSize, // 连接池大小
    extra: {
      connectionLimit: maxConnectionLimit, // 连接限制
      acquireTimeout: config.get<number>('POSTGRES_ACQUIRE_TIMEOUT', 30000), // 获取连接超时时间30s(毫秒milliseconds)
      timeout: config.get<number>('POSTGRES_TIMEOUT', 30000),           // 查询超时 30 秒
      connectTimeout: config.get<number>('POSTGRES_CONNECT_TIMEOUT', 10000),    // 连接建立超时 10 秒
      charset: config.get<string>('POSTGRES_CHARSET', 'utf8mb4'),
      timezone: config.get<string>('POSTGRES_TIMEZONE', '+08:00'),
    },
    retryAttempts: config.get<number>('POSTGRES_RETRY_ATTEMPTS', 10),        // 重试次数
    retryDelay: config.get<number>('POSTGRES_RETRY_DELAY', 3000),        // 重试延迟(毫秒)
    // logging: process.env.NODE_ENV !== 'production',
    // logger: 'advanced-console',
  };
};