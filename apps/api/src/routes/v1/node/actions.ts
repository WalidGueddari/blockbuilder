import { FastifyPluginAsync } from 'fastify';

import { nodeSchema } from '../../../schemas/node.js';
import { NodesService } from '../../../services/nodes.js';

const routes: FastifyPluginAsync = async (fastify, opts) => {
  const { prisma } = fastify;
  const nodesService = new NodesService({ prisma });

  fastify.post<{ Body: { nodesNumber: number } }>(
    '/run-script',
    {
      schema: nodeSchema.createNodes,
    },
    async (request, reply) => {
      try {
        const { nodesNumber } = request.body;
        const network = await nodesService.buildNetwork(nodesNumber);
        return reply.send({ success: true, network });
      } catch (error: any) {
        console.error('Full error:', error);
        return reply.status(500).send({
          success: false,
          error: `Unexpected error: ${error.message}\nFull error: ${error}`,
        });
      }
    },
  );

  fastify.post('/kill-network', async (request, reply) => {
    try {
      const network = await nodesService.killNetwork();
      return reply.send({ success: true, network });
    } catch (error: any) {
      console.error('Full error:', error);
      return reply.status(500).send({
        success: false,
        error: `Unexpected error: ${error.message}\nFull error: ${error}`,
      });
    }
  });
};

export default routes;
