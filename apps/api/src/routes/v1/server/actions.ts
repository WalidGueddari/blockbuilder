import { FastifyPluginAsync } from 'fastify';

import { ServerShcema } from '../../../schemas/server.js';
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

  fastify.post<{ Params: { id: string } }>(
    '/setup/:id',
    {
      schema: ServerShcema.setupDockerAndNginx,
    },
    async (request, reply) => {
      const { id } = request.params;
      try {
        const result = await serverService.setupDockerAndNginx(id);
        reply.send(result);
      } catch (error) {
        reply.status(500).send(error);
      }
    },
  );
};

export default routes;
