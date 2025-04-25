import { FastifyPluginAsync } from 'fastify';
import path from 'path';

import { config } from '../../../config.js';
import { blockchainSchema } from '../../../schemas/v2/blockchain.js';
import { ContainerService } from '../../../services/containers.js';
import { HardhatService } from '../../../services/hardhat.js';
import { JobSevice } from '../../../services/job.js';
import { NewtorkSevice } from '../../../services/network.js';
import { InitNetworkPayload } from '../../../types/network.js';

const routes: FastifyPluginAsync = async (fastify, opts) => {
  const { prisma } = fastify;
  const jobService = new JobSevice({ prisma });
  const networkService = new NewtorkSevice({ prisma });
  const containerService = new ContainerService({ prisma });
  const hardhatService = new HardhatService({ prisma });

  const { bootnodeIndex, baseDir } = config;

  fastify.post<{ Body: { initNetPayload: InitNetworkPayload } }>(
    '/job/start',
    {
      schema: blockchainSchema.setupNetwork,
    },
    async (request, reply) => {
      const { initNetPayload } = request.body;

      try {
        const initNetwork = await networkService.initNetwork(initNetPayload);
        const job = await jobService.initJob(initNetwork.userId, initNetwork.id);

        console.log('Setting up network containers...');
        await containerService.SetUpNetwork(
          initNetwork.nodeCount,
          initNetwork.id,
          initNetwork.chainId,
        );
        console.log('Network containers set up successfully');

        console.log('Saving genesis file...');
        const networkDir = path.join(baseDir, initNetwork.id, 'genesis.json');
        await networkService.saveGenesisFile(initNetwork.id, networkDir);
        console.log('Genesis file saved successfully');

        console.log('Generating initial Docker Compose file (bootnode only)...');
        await containerService.generateDockerComposeFile(true, initNetwork.id);
        console.log('Bootnode Docker Compose file generated successfully');

        console.log('Creating enode URL for bootnode...');
        const bootEnodeUrl = await containerService.createEnodeUrl(initNetwork.id, bootnodeIndex);
        console.log('Bootnode enode URL created successfully');

        console.log('Generating full Docker Compose file with enode URL...');
        await containerService.generateDockerComposeFile(
          false,
          initNetwork.id,
          bootEnodeUrl,
          initNetwork.nodeCount,
        );
        console.log('Full Docker Compose file generated successfully');

        /*         console.info('Generating Hardhat Docker Compose file...');
        await hardhatService.generateHardhatDockerCompose(initNetwork.id, 'DNS'); */

        console.log('Job created:', job.id);
        // jobService.runJob(initNetPayload, initNetwork.id, job.id);

        return reply.send(initNetwork);
      } catch (error) {
        console.error('Error starting network:', error);
        return reply.status(500).send({ error: 'Failed to start network' });
      }
    },
  );
};

export default routes;
