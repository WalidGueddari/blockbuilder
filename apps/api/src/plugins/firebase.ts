import fastifyFirebase from 'fastify-firebase';
import fp from 'fastify-plugin';

import { serviceAccount } from '../config/firebaseConfig.js';

/**
 * plugin to connect to Redis.
 *
 * @see https://github.com/dannyblv/fastify-firebase
 */

export declare type FastifyFirebaseOptions = {};

export default fp<FastifyFirebaseOptions>(
  async (fastify) => {
    fastify.register(fastifyFirebase as any, serviceAccount);
  },
  {
    name: 'firebase',
  },
);
