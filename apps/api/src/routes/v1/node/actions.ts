import { FastifyPluginAsync } from 'fastify';

import { NodeSchema } from '../../../schemas/node.js';
import { NodeService } from '../../../services/nodes.js';

const routes: FastifyPluginAsync = async (fastify, opts) => {
  const { prisma } = fastify;

  const nodeService = new NodeService({ prisma });

  fastify.get<{ Params: { networkId: string } }>(
    '/nodes-by-network/:networkId',
    {
      schema: NodeSchema.getNodesByNetworkId,
    },
    async (request, reply) => {
      try {
        const { networkId } = request.params;
        const nodes = await nodeService.getNodes(networkId);
        return reply.send({ success: true, nodes });
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
