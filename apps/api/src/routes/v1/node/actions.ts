import { exec } from 'child_process';
import { FastifyPluginAsync } from 'fastify';
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
};

export default routes;
