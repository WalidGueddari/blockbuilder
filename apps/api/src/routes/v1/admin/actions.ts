import { FastifyPluginAsync } from 'fastify';

import { registerSchema } from '../../../schemas/v1/index.js';
import { UserSchema } from '../../../schemas/v1/index.js';
import { UsersService } from '../../../services/users.js';
import { CreateUserPayload } from '../../../types/users.js';

const routes: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  const { prisma } = fastify;
  const usersService = new UsersService({ prisma });

  fastify.post<{ Body: CreateUserPayload }>(
    '/create-user',
    {
      schema: registerSchema,
    },
    async (request, reply) => {
      try {
        await usersService.createUser(request.body);
        return reply.code(200).send({
          message: request.t('account_created_successfully'),
          code: 'account_created_successfully',
        });
      } catch (err) {
        throw err;
      }
    },
  );

  fastify.post<{ Params: { userId: string }; Body: { code: string } }>(
    '/activate-user/:userId',
    {
      schema: UserSchema.updateUserStatus,
    },
    async (request, reply) => {
      try {
        const { userId } = request.params;
        const { code } = request.body;

        const user = await usersService.activateUser(userId, code);
        return reply.code(200).send({
          message: request.t('user_status_updated'),
          code: 'user_status_updated',
          data: user,
        });
      } catch (err) {
        throw err;
      }
    },
  );

  fastify.post<{
    Params: { userId: string };
  }>('/deactivate-user/:userId', { schema: UserSchema.deactivateUser }, async (request, reply) => {
    try {
      const { userId } = request.params;
      const user = await usersService.deactivateUser(userId);
      return reply.code(200).send({
        message: request.t('user_deactivated'),
        code: 'user_deactivated',
        data: user,
      });
    } catch (err: any) {
      return reply.code(400).send({ message: err.message });
    }
  });

  fastify.get<{
    Querystring: {
      isActive: boolean;
      page?: number;
      limit?: number;
      date?: string;
      search?: string;
    };
  }>(
    '/get-all-users',
    {
      schema: UserSchema.getAllUsers,
    },
    async (request, reply) => {
      try {
        const { isActive, page = 1, limit = 10, date, search } = request.query;

        const filters = { date, search };
        const data = await usersService.getAllUsers(isActive, page, limit, filters);

        return reply.code(200).send(data);
      } catch (err: any) {
        return reply.code(400).send({
          status: 400,
          message: err.message,
        });
      }
    },
  );
};

export default routes;
