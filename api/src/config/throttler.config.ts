import { ConfigService } from "@nestjs/config";

export const ThrottlerConfig = (config: ConfigService) => ({
  throttlers: [
    {
      name: 'short',
      ttl: config.get<number>('THROTTLE_SHORT_TTL', 1000), // 1 second
      limit: config.get<number>('THROTTLE_SHORT_LIMIT',
        process.env.NODE_ENV !== 'production' ? 100 : 3),   // 3 requests per second
    },
    {
      name: 'medium',
      ttl: config.get<number>('THROTTLE_MEDIUM_TTL', 10000), // 10 seconds
      limit: config.get<number>('THROTTLE_MEDIUM_LIMIT',
        process.env.NODE_ENV !== 'production' ? 100 : 20),  // 20 requests per 10 seconds
    },
    {
      name: 'long',
      ttl: config.get<number>('THROTTLE_LONG_TTL', 60000), // 1 minute
      limit: config.get<number>('THROTTLE_LONG_LIMIT',
        process.env.NODE_ENV !== 'production' ? 500 : 100), // 100 requests per minute
    },
  ],
});