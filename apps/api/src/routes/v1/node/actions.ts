import { FastifyPluginAsync } from 'fastify';

import { nodeSchema } from '../../../schemas/node.js';
import { NewtorkSevice } from '../../../services/network.js';
import { NodesService } from '../../../services/nodes.js';
import { InitNetworkPayload } from '../../../types/network.js';

const routes: FastifyPluginAsync = async (fastify, opts) => {
  const { prisma } = fastify;
  const nodesService = new NodesService({ prisma });
  const networkService = new NewtorkSevice({ prisma });

  fastify.post<{ Body: { initNetPayload: InitNetworkPayload } }>(
    '/build-network',
    {
      schema: nodeSchema.createNodes,
    },
    async (request, reply) => {
      try {
        const { initNetPayload } = request.body;
        const initNetwork = await networkService.initNetwork(initNetPayload);
        if (!initNetwork) {
          throw new Error('Network initialization failed');
        }
        const network = await nodesService.SetUpNetwork(initNetwork.nodeCount, initNetwork.id);
        return reply.send({ success: true, initNetwork, network });
      } catch (error: any) {
        console.error('Full error:', error);
        return reply.status(500).send({
          success: false,
          error: `Unexpected error: ${error.message}\nFull error: ${error}`,
        });
      }
    },
  );

  fastify.post<{ Body: { networId: string } }>(
    '/generate-docker-compose',
    {
      schema: nodeSchema.generateDockerCompose,
    },
    async (request, reply) => {
      try {
        const { networId } = request.body;

        const network = await networkService.getNetworkById(networId);
        if (!network) {
          throw new Error('Network not found');
        }

        const dockerComposeBootNode = await nodesService.generateDockerComposeFile(
          true,
          network.id,
        );
        const enode = await nodesService.createEnodeUrl(network.id);
        const dockerComposeNode = await nodesService.generateDockerComposeFile(
          false,
          networId,
          enode,
          network.nodeCount,
        );

        const Outputs = {
          EnodeURL: enode,
          bootNodeOutput: dockerComposeBootNode,
          nodesOutput: dockerComposeNode,
        };

        return reply.send({ success: true, Outputs });
      } catch (error: any) {
        console.error('Full error:', error);
        return reply.status(500).send({
          success: false,
          error: `Unexpected error: ${error.message}\nFull error: ${error}`,
        });
      }
    },
  );

  fastify.post<{ Body: { networId: string } }>(
    '/start-network',
    {
      schema: nodeSchema.startNetwork,
    },
    async (request, reply) => {
      try {
        const { networId } = request.body;

        const network = await networkService.getNetworkById(networId);
        if (!network) {
          throw new Error('Network not found');
        }

        const startNetwork = await nodesService.runNode(network.id, network.nodeCount);
        if (!startNetwork) {
          throw new Error('Network start failed');
        }
        return reply.send({ success: true, startNetwork });
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
