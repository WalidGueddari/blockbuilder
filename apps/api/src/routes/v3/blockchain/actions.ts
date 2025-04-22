import { FastifyPluginAsync } from 'fastify';
import path from 'path';

import { config } from '../../../config.js';
import { Status } from '../../../constants.js';
import { ServerShcema } from '../../../schemas/v1/server.js';
import { blockchainSchema } from '../../../schemas/v2/blockchain.js';
import { ContainerService } from '../../../services/containers.js';
import { NewtorkSevice } from '../../../services/network.js';
import { ServerService } from '../../../services/server.js';
import { InitNetworkPayload } from '../../../types/network.js';
import { StartNodePayload } from '../../../types/node.js';
import { CreateAzureVMParams } from '../../../types/server.js';

const routes: FastifyPluginAsync = async (fastify, opts) => {
  const { prisma } = fastify;
  const containerService = new ContainerService({ prisma });
  const networkService = new NewtorkSevice({ prisma });
  const serverService = new ServerService({ prisma });

  const { bootnodeIndex, baseDir } = config;

  fastify.post<{ Body: { initNetPayload: InitNetworkPayload } }>(
    '/setup-network',
    {
      schema: blockchainSchema.setupNetwork,
    },
    async (request, reply) => {
      try {
        const { initNetPayload } = request.body;

        const azurePayload: CreateAzureVMParams = {
          resourceGroup: initNetPayload.name,
          userId: initNetPayload.userId,
          vmName: initNetPayload.name,
          sshKeyName: initNetPayload.name,
        };

        fastify.log.info('Received /setup-network request');
        console.log('Creating Azure VM...');
        const server = await serverService.createAzureVMServer(azurePayload);
        fastify.log.info(`Azure VM created with ID: ${server.id}`);

        console.log('Initializing network...');
        const initNetwork = await networkService.initNetwork(initNetPayload, server.id);
        fastify.log.info(`Network initialized with ID: ${initNetwork.id}`);

        const networkDir = path.join(baseDir, initNetwork.id, 'genesis.json');
        console.log('Setting up network containers...');
        await containerService.SetUpNetwork(
          initNetwork.nodeCount,
          initNetwork.id,
          initNetwork.chainId,
        );
        fastify.log.info('Network containers set up successfully');

        console.log('Saving genesis file...');
        const saveGenesisFile = await networkService.saveGenesisFile(initNetwork.id, networkDir);
        console.log('Genesis file:', saveGenesisFile);
        fastify.log.info('Genesis file saved');

        console.log('Generating initial Docker Compose file (bootnode only)...');
        await containerService.generateDockerComposeFile(true, initNetwork.id);
        fastify.log.info('Bootnode Docker Compose file generated');

        console.log('Creating enode URL for bootnode...');
        const bootEnodeUrl = await containerService.createEnodeUrl(initNetwork.id, bootnodeIndex);
        fastify.log.info(`Bootnode enode URL created: ${bootEnodeUrl}`);

        console.log('Generating full Docker Compose file with enode URL...');
        await containerService.generateDockerComposeFile(
          false,
          initNetwork.id,
          bootEnodeUrl,
          initNetwork.nodeCount,
        );
        fastify.log.info('Full Docker Compose file generated');

        if (!initNetwork) {
          fastify.log.error('Network initialization failed');
          throw new Error('Network initialization failed');
        }

        // Add serverId under initNetwork to include the Azure VM server ID in the response.
        initNetwork.serverId = server.id;

        fastify.log.info(
          `Network initialized with id: ${initNetwork.id}, nodeCount: ${initNetwork.nodeCount}, serverId: ${server.id}`,
        );
        console.log(
          `Network initialized: ID=${initNetwork.id}, Nodes=${initNetwork.nodeCount}, Server ID=${server.id}`,
        );

        return reply.send(initNetwork);
      } catch (error: any) {
        fastify.log.error(error);
        console.error('Setup Network Error:', error);
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
        fastify.log.info('Received /start-network request');
        console.log(`Setting up Docker and Nginx on VM ID: ${payload.vmId}...`);
        await serverService.setupDockerAndNginx(payload.vmId, false);
        fastify.log.info('Docker and Nginx setup complete');

        console.log('Transferring network directory to VM...');
        await serverService.transferDirectoryByName(payload.vmId, payload.networkId);
        fastify.log.info('Directory transferred to VM');

        // console.log('Stopping any running Besu nodes...');
        // await containerService.killBesuNode();
        // fastify.log.info('Existing Besu nodes terminated');

        console.log('Starting new node...');
        const start = await containerService.runNode(payload);

        if (start.success) {
          await networkService.updateStatus(payload.networkId, Status.ACTIVE);
          fastify.log.info(`Network started successfully on VM ID: ${payload.vmId}`);
          console.log(`Network started successfully on VM ID: ${payload.vmId}`);
        } else {
          await networkService.updateStatus(payload.networkId, Status.FAILED);
          fastify.log.error(`Failed to start network on VM ID: ${payload.vmId}`);
          console.error(`Failed to start network on VM ID: ${payload.vmId}`);
        }

        return reply.send(start);
      } catch (error: any) {
        fastify.log.error(`Error starting network: ${error.message}`);
        console.error('Start Network Error:', error);

        await networkService.updateStatus(payload.networkId, Status.FAILED);

        return reply.status(500).send({ success: false, error });
      }
    },
  );

  fastify.post<{ Body: { networkId: string } }>(
    '/setup-hardhat',
    {
      schema: {
        body: {
          type: 'object',
          required: ['networkId'],
          properties: {
            networkId: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { networkId } = request.body;

        fastify.log.info('Received /setup-hardhat request');
        console.log(`Setting up Hardhat for network: ${networkId}`);

        // Generate Hardhat Docker Compose file
        await containerService.generateHardhatDockerCompose(networkId);
        fastify.log.info('Hardhat Docker Compose file generated');

        return reply.send({ success: true, message: 'Hardhat setup completed successfully' });
      } catch (error: any) {
        fastify.log.error(`Error setting up Hardhat: ${error.message}`);
        console.error('Setup Hardhat Error:', error);
        return reply.status(500).send({ success: false, error: error.message });
      }
    },
  );

  fastify.post<{ Body: { networkId: string; vmId: string } }>(
    '/start-hardhat',
    {
      schema: {
        body: {
          type: 'object',
          required: ['networkId', 'vmId'],
          properties: {
            networkId: { type: 'string' },
            vmId: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { networkId, vmId } = request.body;

        fastify.log.info('Received /start-hardhat request');
        console.log(`Starting Hardhat for network: ${networkId} on VM: ${vmId}`);

        // Start Hardhat container
        const result = await containerService.startHardhat(networkId, vmId);

        if (!result.success) {
          fastify.log.error(`Failed to start Hardhat: ${result.errors?.join(', ')}`);
          return reply.status(500).send(result);
        }

        fastify.log.info('Hardhat started successfully');
        return reply.send(result);
      } catch (error: any) {
        fastify.log.error(`Error starting Hardhat: ${error.message}`);
        console.error('Start Hardhat Error:', error);
        return reply.status(500).send({ success: false, error: error.message });
      }
    },
  );

  fastify.post<{ Body: { networkId: string; vmId: string } }>(
    '/stop-hardhat',
    {
      schema: {
        body: {
          type: 'object',
          required: ['networkId', 'vmId'],
          properties: {
            networkId: { type: 'string' },
            vmId: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { networkId, vmId } = request.body;

        fastify.log.info('Received /stop-hardhat request');
        console.log(`Stopping Hardhat for network: ${networkId} on VM: ${vmId}`);

        // Stop Hardhat container
        const result = await containerService.stopHardhat(networkId, vmId);

        if (!result.success) {
          fastify.log.error(`Failed to stop Hardhat: ${result.errors?.join(', ')}`);
          return reply.status(500).send(result);
        }

        fastify.log.info('Hardhat stopped successfully');
        return reply.send(result);
      } catch (error: any) {
        fastify.log.error(`Error stopping Hardhat: ${error.message}`);
        console.error('Stop Hardhat Error:', error);
        return reply.status(500).send({ success: false, error: error.message });
      }
    },
  );
};

export default routes;
