import { FastifyPluginAsync } from 'fastify';
import path from 'path';

import { config } from '../../../config.js';
import { blockchainSchema } from '../../../schemas/v2/blockchain.js';
import { jobSchema } from '../../../schemas/v2/jobs.js';
import { ContainerService } from '../../../services/containers.js';
// import { HardhatService } from '../../../services/hardhat.js';
import { JobService } from '../../../services/job.js';
import { NewtorkSevice } from '../../../services/network.js';
import { InitNetworkPayload } from '../../../types/network.js';

const routes: FastifyPluginAsync = async (fastify, opts) => {
  const { prisma, redis } = fastify;
  const jobService = new JobService({ prisma, redis });
  const networkService = new NewtorkSevice({ prisma });
  const containerService = new ContainerService({ prisma });
  //const hardhatService = new HardhatService({ prisma });

  const { bootnodeIndex, baseDir } = config;

  fastify.post<{ Body: { initNetPayload: InitNetworkPayload } }>(
    '/job/start',
    {
      schema: blockchainSchema.setupNetwork,
    },
    async (request, reply) => {
      const { initNetPayload } = request.body;

      try {
        const isLimitReached = await jobService.limitDemoUserNetworks(initNetPayload.userId);

        if (isLimitReached) {
          return reply.send({
            success: false,
          });
        }

        const initNetwork = await networkService.initNetwork(initNetPayload);

        const jobRow = await jobService.initJob(initNetwork.userId, initNetwork.id);
        // const jobRow = await jobService.initJob('cm9wx3ldi0000ivt1logv5tf8', 'cma6xf6q1000110r7w5283v1p');

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

        console.log('Job created:', jobRow.id);

        console.log('Starting Queue...');
        await fastify.bull.deployQueue.add(
          'deploy',
          { payload: initNetPayload, networkId: initNetwork.id, jobId: jobRow.id },
          {
            attempts: 3,
            backoff: { type: 'exponential', delay: 60_000 },
            removeOnComplete: { age: 86_400, count: 1000 },
            removeOnFail: { age: 604_800 },
          },
        );

        return reply.send({ success: true, network: initNetwork });
      } catch (error) {
        console.error('Error starting network:', error);
        return reply.status(500).send({ error: 'Failed to start network' });
      }
    },
  );

  fastify.get<{ Params: { userId: string }; Querystring: { page?: string; limit?: string } }>(
    '/jobs/:userId',
    {
      schema: jobSchema.getJobsByUserId,
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

        const { data, pagination } = await jobService.getJob(userId, page, limit);

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
