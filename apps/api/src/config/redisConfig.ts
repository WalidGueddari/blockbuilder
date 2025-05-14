/* Shared connection options for BullMQ worker & queue */
import type { RedisOptions } from 'ioredis';

import { config } from '../config.js';

const { redisHost, redisPort, redisPassword, redisFamily } = config;

export const redisConfig: RedisOptions = {
  host: redisHost,
  port: redisPort,
  password: redisPassword,
  family: redisFamily,
};
