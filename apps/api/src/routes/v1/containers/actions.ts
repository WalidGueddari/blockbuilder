import { FastifyPluginAsync } from 'fastify';

import { config } from '../../../config.js';
import { ContainerSchema } from '../../../schemas/container.js';
import { ContainerService } from '../../../services/containers.js';
import { NewtorkSevice } from '../../../services/network.js';
import { NodeService } from '../../../services/nodes.js';
import { InitNetworkPayload } from '../../../types/network.js';

const routes: FastifyPluginAsync = async (fastify, opts) => {
  const { prisma } = fastify;
  const containerService = new ContainerService({ prisma });
  const networkService = new NewtorkSevice({ prisma });
  const { bootnodeIndex } = config;

  fastify.post<{ Body: { initNetPayload: InitNetworkPayload } }>(
    '/build-network',
    {
      schema: ContainerSchema.createNetwork,
    },
    async (request, reply) => {
      try {
        const { initNetPayload } = request.body;
        const initNetwork = await networkService.initNetwork(initNetPayload);

        if (!initNetwork) {
          throw new Error('Network initialization failed');
        }

        await containerService.SetUpNetwork(initNetwork.nodeCount, initNetwork.id);
        const dockerComposeBootNode = await containerService.generateDockerComposeFile(
          true,
          initNetwork.id,
        );
        const bootEnodeUrl = await containerService.createEnodeUrl(initNetwork.id, bootnodeIndex);
        const dockerComposeNode = await containerService.generateDockerComposeFile(
          false,
          initNetwork.id,
          bootEnodeUrl,
          initNetwork.nodeCount,
        );

        const Outputs = {
          Network: initNetwork,
          EnodeURL: bootEnodeUrl,
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
      schema: ContainerSchema.startNetwork,
    },
    async (request, reply) => {
      try {
        const { networId } = request.body;
        const network = await networkService.getNetworkById(networId);

        if (!network) {
          throw new Error('Network not found');
        }

        const startNetwork = await containerService.runNode(network.id, network.nodeCount);

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

  fastify.get<{ Params: { networkId: string } }>(
    '/get_logs/:networkId',
    {
      schema: ContainerSchema.getLogs,
    },
    async (request, reply) => {
      try {
        const { networkId } = request.params;
        const network = await networkService.getNetworkById(networkId);

        if (!network) {
          throw new Error('Network not found');
        }
        const logs = await containerService.getNodesLogs(network.nodeCount);

        if (!logs) {
          throw new Error('Logs not found');
        }

        return reply.send({ success: true, logs });
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
