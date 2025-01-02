import { exec } from 'child_process';
import { FastifyPluginAsync } from 'fastify';
import { promisify } from 'util';

import { nodeSchema } from '../../../schemas/node.js';
import { NetworksService } from '../../../services/networks.js';
import { NodesService } from '../../../services/nodes.js';

const execAsync = promisify(exec);

const routes: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  const networksService = new NetworksService({ prisma: fastify.prisma });
  const nodesService = new NodesService({ prisma: fastify.prisma });

  fastify.post<{ Body: { nodesNumber: number } }>(
    '/run-script',
    {
      schema: nodeSchema.createNodes,
    },
    async (request, reply) => {
      try {
        const { nodesNumber } = request.body;
        const { stdout, stderr } = await execAsync(
          `echo ${nodesNumber} | /home/khalil/saas-monorepo/apps/api/src/scripts/network_build.sh`,
          {
            shell: '/bin/bash',
          },
        );
        console.log('stdout:', stdout);
        console.log('stderr:', stderr);
        return reply.send({ success: true, output: stdout });
      } catch (error: any) {
        console.error('Full error:', error);
        return reply.status(500).send({
          success: false,
          error: `Unexpected error: ${error.message}\nFull error: ${error}`,
        });
      }
    },
  );

  fastify.get<{ Params: { networkId: string } }>(
    '/network/:networkId/nodes',
    {
      schema: nodeSchema.getNetworkNodes,
    },
    async (request, reply) => {
      const { networkId } = request.params;
      const nodes = await nodesService.getNetworkNodes(networkId);
      return reply.send(nodes);
    },
  );

  fastify.get<{ Params: { nodeId: string } }>(
    '/:nodeId',
    {
      schema: nodeSchema.getNodeById,
    },
    async (request, reply) => {
      const { nodeId } = request.params;
      const node = await nodesService.getNodeById(nodeId);

      if (!node) {
        return reply.status(404).send({
          success: false,
          error: `Node with id ${nodeId} not found`,
        });
      }

      return reply.send(node);
    },
  );
};

export default routes;
