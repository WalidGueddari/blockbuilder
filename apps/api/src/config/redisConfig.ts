/* Shared connection options for BullMQ worker & queue */
import type { RedisOptions } from 'ioredis';

export const redisConfig: RedisOptions = {
  host: process.env.REDIS_HOST ?? 'localhost',
  port: Number(process.env.REDIS_PORT ?? '6379'),
  password: process.env.REDIS_PASSWORD ?? 'passer',
  family: 4,
};
