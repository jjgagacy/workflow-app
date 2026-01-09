import { ConfigService } from "@nestjs/config";

export class RedisUrlBuilder {
  // build redis connect url
  // url: `redis[s]://[[username][:password]@][host][:port][/db-number]`
  static buildUrl(configService: ConfigService) {
    const protocol = configService.get<string>('REDIS_SSL', 'false') === 'true' ? 'rediss' : 'redis';
    const username = configService.get<string>('REDIS_USERNAME');
    const password = configService.get<string>('REDIS_PASSWORD');
    const host = configService.get<string>('REDIS_HOST', 'localhost');
    const port = configService.get<number>('REDIS_PORT', 6379);
    const db = configService.get<number>('REDIS_DB', 0);

    let url = `${protocol}://`;

    if (username || password) {
      if (username) {
        url += encodeURIComponent(username);
      }
      if (password) {
        url += `:${encodeURIComponent(password)}`;
      }
      url += '@';
    }

    url += `${host}:${port}`;

    if (db !== 0) {
      url += `/${db}`;
    }

    return url;
  }
}
