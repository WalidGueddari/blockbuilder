import { FastifyPluginAsync } from 'fastify';

import { config } from '../../../config.js';
import { BlockscoutService } from '../../../services/blockscout.js';

const routes: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  const { prisma } = fastify;
  const blockscoutService = new BlockscoutService({ prisma });
  fastify.post<{ Body: { networkId: string; userId: string } }>(
    '/create',
    {
      schema: {
        tags: ['blockscout'],
        body: {
          type: 'object',
          properties: {
            networkId: { type: 'string' },
            userId: { type: 'string' },
          },
          required: ['networkId', 'userId'],
        },
      },
    },
    async (request, reply) => {
      try {
        const { networkId, userId } = request.body;
        const blockscout = await blockscoutService.deployingBlockscout(networkId, userId);
        reply.status(200).send({
          status: 'success',
          message: 'Blockscout deployed successfully',
          data: blockscout,
        });
      } catch (err: any) {
        fastify.log.error(err);
        return reply.status(500).send({ success: false, error: err.message });
      }
    },
  );
};

export default routes;
