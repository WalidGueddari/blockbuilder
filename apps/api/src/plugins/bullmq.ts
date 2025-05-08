import { Queue, QueueEvents } from 'bullmq';
import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

import { redisConfig } from '../config/redisConfig.js';

export declare type FastifyBullOptions = {};

async function fastifyBull(fastify: FastifyInstance, options: FastifyBullOptions) {
  const deployQueue = new Queue('deploy-network', { connection: redisConfig });
  const deployEvents = new QueueEvents('deploy-network', { connection: redisConfig });

  fastify.decorate('bull', { deployQueue, deployEvents });

  fastify.addHook('onClose', async () => {
    await deployQueue.close();
    await deployEvents.close();
  });
}

export default fp(fastifyBull, {
  name: 'bull',
});
