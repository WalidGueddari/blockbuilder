import { exec } from 'child_process';
import { FastifyPluginAsync } from 'fastify';
import { promisify } from 'util';

import { networkSchema } from '../../../schemas/network.js';
import { NetworksService } from '../../../services/networks.js';
import { CreateNetworkPayload } from '../../../types/network.js';

const execAsync = promisify(exec);

const routes: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  const networksService = new NetworksService({ prisma: fastify.prisma });

  fastify.post<{ Body: CreateNetworkPayload }>(
    '/create-network',
    {
      schema: networkSchema.createNetwork,
    },
    async (request, reply) => {
      try {
        const { userId, nodeCount } = request.body;
        const checkUser = await fastify.prisma.user.findUnique({
          where: { id: userId },
        });
        if (!checkUser) {
          return reply.status(500).send({
            success: false,
            error: 'User does not exist',
          });
        }

        const { stdout, stderr } = await execAsync(
          `echo ${nodeCount} | /home/viconee/BlockChain_Builder/apps/api/src/scripts/network_build.sh`,
          {
            shell: '/bin/bash',
          },
        );

        console.log('Script stdout:', stdout);
        console.log('Script stderr:', stderr);

        const network = await networksService.createNetwork(request.body);

        return reply.status(200).send({ success: true, network });
      } catch (error: any) {
        console.error('Error creating network:', error);
        return reply.status(500).send({
          success: false,
          error: `Error creating network: ${error.message}`,
        });
      }
    },
  );

  // New route to delete a network
  fastify.delete<{ Params: { networkId: string } }>(
    '/delete-network/:networkId',
    {
      schema: networkSchema.deleteNetwork,
    },
    async (request, reply) => {
      try {
        const { networkId } = request.params;
        const deletedNetwork = await networksService.deleteNetwork(networkId);
        return reply.status(200).send({ success: true, network: deletedNetwork });
      } catch (error: any) {
        console.error('Error deleting network:', error);
        return reply.status(500).send({
          success: false,
          error: `Error deleting network: ${error.message}`,
        });
      }
    },
  );

  // New route to get user networks
  fastify.get<{ Params: { userId: string } }>(
    '/fetchNetworks/:userId',
    {
      schema: networkSchema.getUserNetworks,
    },
    async (request, reply) => {
      try {
        const { userId } = request.params;
        const networks = await networksService.getUserNetworks(userId);
        return reply.status(200).send({ success: true, networks });
      } catch (error: any) {
        console.error('Error fetching user networks:', error);
        return reply.status(500).send({
          success: false,
          error: `Error fetching user networks: ${error.message}`,
        });
      }
    },
  );

  // New route to stop a network
  fastify.post<{ Params: { networkId: string } }>(
    '/stop-network/:networkId',
    {
      schema: networkSchema.stopNetwork,
    },
    async (request, reply) => {
      try {
        const { networkId } = request.params;
        await networksService.stopNetwork(networkId);
        return reply.status(200).send({ success: true, message: 'Network stopped successfully' });
      } catch (error: any) {
        console.error('Error stopping network:', error);
        return reply.status(500).send({
          success: false,
          error: `Error stopping network: ${error.message}`,
        });
      }
    },
  );

  // New route to decrement node count
  fastify.post<{ Params: { networkId: string } }>(
    '/decrement-node-count/:networkId',
    {
      schema: networkSchema.decrementNodeCount,
    },
    async (request, reply) => {
      try {
        const { networkId } = request.params;
        await networksService.decrementNodeCount(networkId);
        return reply
          .status(200)
          .send({ success: true, message: 'Node count decremented successfully' });
      } catch (error: any) {
        console.error('Error decrementing node count:', error);
        return reply.status(500).send({
          success: false,
          error: `Error decrementing node count: ${error.message}`,
        });
      }
    },
  );
};

export default routes;
