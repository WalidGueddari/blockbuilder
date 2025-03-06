import { FastifyPluginAsync } from 'fastify';

import { config } from '../../../config.js';
import { blockchainSchema } from '../../../schemas/v2/blockchain.js';
import { ContainerService } from '../../../services/containers.js';
import { NewtorkSevice } from '../../../services/network.js';
import { InitNetworkPayload } from '../../../types/network.js';
import { StartNodePayload } from '../../../types/node.js';

const routes: FastifyPluginAsync = async (fastify, opts) => {
  const { prisma } = fastify;
  const containerService = new ContainerService({ prisma });
  const networkService = new NewtorkSevice({ prisma });

  const { bootnodeIndex } = config;

  fastify.post<{ Body: { initNetPayload: InitNetworkPayload; vmId: string } }>(
    '/setup-network',
    {
      schema: blockchainSchema.setupNetwork,
    },
    async (request, reply) => {
      try {
        const { initNetPayload, vmId } = request.body;
        fastify.log.info(`Initializing network on VM id: ${vmId}`);

        const initNetwork = await networkService.initNetwork(initNetPayload, vmId);
        await containerService.SetUpNetwork(initNetwork.nodeCount, initNetwork.id);
        await containerService.generateDockerComposeFile(true, initNetwork.id);
        const bootEnodeUrl = await containerService.createEnodeUrl(initNetwork.id, bootnodeIndex);
        await containerService.generateDockerComposeFile(
          false,
          initNetwork.id,
          bootEnodeUrl,
          initNetwork.nodeCount,
        );

        if (!initNetwork) {
          fastify.log.error('Network initialization failed');
          throw new Error('Network initialization failed');
        }

        fastify.log.info(
          `Network initialized with id: ${initNetwork.id}, nodeCount: ${initNetwork.nodeCount}`,
        );

        return reply.send(initNetwork);
      } catch (error: any) {
        fastify.log.error(error);
        return reply.status(500).send({ success: false, error: error.message });
      }
    },
  );

  fastify.post<{ Body: { payload: StartNodePayload } }>(
    '/start-network',
    {
      schema: blockchainSchema.startNetwork,
    },
    async (request, reply) => {
      try {
        const { payload } = request.body;

        await containerService.killBesuNode();
        const start = await containerService.runNode(payload);

        fastify.log.info(`Starting network on VM id: ${payload.vmId}`);
        return reply.send(start);
      } catch (error: any) {
        fastify.log.error(error);
        return reply.status(500).send({ success: false, error: error.message });
      }
    },
  );
};
export default routes;
