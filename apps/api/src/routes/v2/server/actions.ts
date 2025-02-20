import { FastifyPluginAsync } from 'fastify';

import { ServerShcema } from '../../../schemas/v1/server.js';
import { ServerService } from '../../../services/server.js';
import { CreateAzureVMParams } from '../../../types/server.js';

const routes: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  const { prisma } = fastify;
  const serverService = new ServerService({ prisma });

  fastify.post<{ Body: { payload: CreateAzureVMParams } }>(
    '/create',
    {
      schema: ServerShcema.createServer,
    },
    async (request, reply) => {
      const { payload } = request.body;
      try {
        const result = await serverService.createAzureVMServer(payload);
        reply.send(result);
      } catch (error) {
        reply.status(500).send(error);
      }
    },
  );

  fastify.post<{ Body: { id: string; networkId: string } }>(
    '/setup',
    {
      schema: ServerShcema.setupDockerAndNginx,
    },
    async (request, reply) => {
      const { id, networkId } = request.body;
      try {
        const result = await serverService.setupDockerAndNginx(id);
        await serverService.transferDirectoryByName(id, networkId);
        reply.send(result);
      } catch (error) {
        reply.status(500).send(error);
      }
    },
  );
};

export default routes;
