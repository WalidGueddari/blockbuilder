import { exec } from 'child_process';
import { FastifyPluginAsync } from 'fastify';
import { CreateNetworkPayload } from 'src/types/network.js';
import { promisify } from 'util';

import { nodeSchema } from '../../../schemas/node.js';
import { NetworksService } from '../../../services/networks.js';

const execAsync = promisify(exec);

const routes: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  const networksService = new NetworksService({ prisma: fastify.prisma });

  fastify.post<{ Body: { nodesNumber: number } }>(
    '/run-script',
    {
      schema: nodeSchema.createNodes,
    },
    async (request, reply) => {
      try {
        const { nodesNumber } = request.body;
        const { stdout, stderr } = await execAsync(
          `echo ${nodesNumber} | /home/viconee/BlockChain_Builder/apps/api/src/scripts/network_build.sh`,
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

  fastify.post<{ Body: CreateNetworkPayload }>(
    '/create-network',
    {
      schema: nodeSchema.createNetwork,
    },
    async (request, reply) => {
      try {
        const { nodeCount } = request.body;
        const { stdout, stderr } = await execAsync(
          `echo ${nodeCount} | /home/viconee/BlockChain_Builder/apps/api/src/scripts/network_build.sh`,
          {
            shell: '/bin/bash',
          },
        );

        console.log('Script stdout:', stdout);
        console.log('Script stderr:', stderr);

        if (stderr) {
          return reply.status(500).send({
            success: false,
            error: `Script execution failed: ${stderr}`,
          });
        }

        const network = await networksService.createNetwork(request.body);
        return reply.send({ success: true, network });
      } catch (error: any) {
        console.error('Error creating network:', error);
        return reply.status(500).send({
          success: false,
          error: `Error creating network: ${error.message}`,
        });
      }
    },
  );
};

export default routes;
