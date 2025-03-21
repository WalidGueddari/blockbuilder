import { FastifyPluginAsync } from 'fastify';
import path from 'path';

import { config } from '../../../config.js';
import { Status } from '../../../constants.js';
import { blockchainSchema } from '../../../schemas/v2/blockchain.js';
import { ContainerService } from '../../../services/containers.js';
import { NewtorkSevice } from '../../../services/network.js';
import { InitNetworkPayload } from '../../../types/network.js';
import { StartNodePayload } from '../../../types/node.js';

const routes: FastifyPluginAsync = async (fastify, opts) => {
  const { prisma } = fastify;
  const containerService = new ContainerService({ prisma });
  const networkService = new NewtorkSevice({ prisma });

  const { bootnodeIndex, baseDir } = config;

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

        const networkDir = path.join(baseDir, initNetwork.id, 'genesis.json');

        await containerService.SetUpNetwork(
          initNetwork.nodeCount,
          initNetwork.id,
          initNetwork.chainId,
        );
        const saveGenesisFile = await networkService.saveGenesisFile(initNetwork.id, networkDir);
        console.log('Genesis file:', saveGenesisFile);
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
      const { payload } = request.body;
      try {
        // Stop any running Besu node before starting a new one
        await containerService.killBesuNode();

        // Attempt to start the node
        const start = await containerService.runNode(payload);

        if (start.success) {
          // If the node starts successfully, update the status to ACTIVE
          await networkService.updateStatus(payload.networkId, Status.ACTIVE);
          fastify.log.info(`Network started successfully on VM id: ${payload.vmId}`);
        } else {
          // If node start fails, update status to FAILED
          await networkService.updateStatus(payload.networkId, Status.FAILED);
          fastify.log.error(`Failed to start network on VM id: ${payload.vmId}`);
        }

        return reply.send(start);
      } catch (error: any) {
        fastify.log.error(`Error starting network: ${error.message}`);

        // Ensure network status is set to FAILED if an exception occurs
        await networkService.updateStatus(payload.networkId, Status.FAILED);

        return reply.status(500).send({ success: false, error });
      }
    },
  );
};
export default routes;
