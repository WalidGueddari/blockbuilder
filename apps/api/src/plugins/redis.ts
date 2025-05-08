import redis, { FastifyRedisPluginOptions } from '@fastify/redis';
import fp from 'fastify-plugin';

import { redisConfig } from '../config/redisConfig.js';

/**
 * plugin to connect to Redis.
 *
 * @see https://github.com/fastify/fastify-redis
 */

export default fp<FastifyRedisPluginOptions>(
  async (fastify) => {
    fastify.register(redis, redisConfig);
  },
  {
    name: 'redis',
  },
);
