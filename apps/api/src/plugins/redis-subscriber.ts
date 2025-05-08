// src/plugins/redis-subscriber.ts
import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import type { Redis } from 'ioredis';

import { jobSubscribers } from '../constants.js';

export declare type RedisSubscriberOptions = {};

async function RedisSubscriber(fastify: FastifyInstance, options: RedisSubscriberOptions) {
  // 1) Duplicate & connect your Redis client
  const sub = fastify.redis.duplicate() as Redis;

  // 2) Subscribe to the jobs:* pattern
  await sub.psubscribe('jobs:*');

  // 3) Listen for pmessage events
  sub.on('pmessage', (_pattern, channel: string, message: string) => {
    const parts = channel.split(':');
    if (parts.length !== 2) return;
    const userId = parts[1];
    if (!userId) return;
    const conns = jobSubscribers.get(userId);
    if (!conns) return;

    for (const ws of conns) {
      if (ws.readyState === ws.OPEN) {
        ws.send(message);
      }
    }
  });

  // 4) Clean up when Fastify closes
  fastify.addHook('onClose', async () => {
    await sub.punsubscribe('jobs:*');
    await sub.disconnect();
  });
}

export default fp(RedisSubscriber, {
  name: 'redis-subscriber',
  dependencies: ['redis'],
});
