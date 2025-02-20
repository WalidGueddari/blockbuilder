import { FastifyPluginAsync } from 'fastify';

import { networkSchema } from '../../../schemas/v1/network.js';
import { NewtorkSevice } from '../../../services/network.js';

const routes: FastifyPluginAsync = async (fastify, opts) => {
  const { prisma } = fastify;
  const networkService = new NewtorkSevice({ prisma });

  fastify.get<{ Params: { userId: string }; Querystring: { page?: string; limit?: string } }>(
    '/:userId',
    {
      schema: networkSchema.getNetworksByUserId,
    },
    async (request, reply) => {
      try {
        const { userId } = request.params;
        const page = parseInt(request.query.page || '1', 10);
        const limit = parseInt(request.query.limit || '10', 10);

        // Validate that page and limit are positive integers
        if (isNaN(page) || page < 1) {
          return reply.status(400).send({
            success: false,
            error: 'Invalid page number. It must be a positive integer.',
          });
        }

        if (isNaN(limit) || limit < 1) {
          return reply.status(400).send({
            success: false,
            error: 'Invalid limit. It must be a positive integer.',
          });
        }

        const { data, pagination } = await networkService.getNetworksByUserId(page, limit, userId);

        return reply.send({ success: true, data, pagination });
      } catch (error: any) {
        console.error('Full error:', error);
        return reply.status(500).send({
          success: false,
          error: `Unexpected error: ${error.message}\nFull error: ${error}`,
        });
      }
    },
  );
};

export default routes;
