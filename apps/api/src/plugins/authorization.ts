import { User } from '@saas-monorepo/database';
import { FastifyInstance, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import jwt from 'jsonwebtoken';

import { AuthorizationService } from '../services/authorization.js';

/**
 * Authorization plugin that handle every step in authorization process.
 *
 */
async function authorization(fastify: FastifyInstance) {
  const { httpErrors, prisma } = fastify;
  const authorizationService = new AuthorizationService({
    prisma,
  });
  async function verifyToken(request: FastifyRequest) {
    const headerValue = request.headers['authorization'] || '';

    const matches = headerValue.match(/bearer\s+(\S+)/i);
    const token = matches ? matches[1] : null;
    if (!token) {
      throw httpErrors.unauthorized(
        // @ts-ignore
        request.t('entity-not-found', {
          // @ts-ignore
          entity: request.t('token'),
        }) as string,
      );
    }
    try {
      request.loggedUser = await authorizationService.verifyAccessToken(token as string);
    } catch (err) {
      throw err;
    }
  }

  async function verifyWsToken(request: FastifyRequest) {
    let token: string | undefined = (request.headers['authorization'] as string | undefined)?.split(
      ' ',
    )[1];

    if (!token && typeof request.query === 'object' && request.query !== null) {
      token = (request.query as Record<string, string>).token;
    }

    if (!token) {
      throw fastify.httpErrors.unauthorized('Missing access token');
    }

    request.loggedUser = await authorizationService.verifyAccessToken(token);
  }

  fastify.decorate<any>('verifyWsToken', verifyWsToken);
  fastify.decorate<any>('verifyToken', verifyToken);
  fastify.decorateRequest<User | null>('loggedUser', null);
}

export default fp(authorization, {
  name: 'authorization',
  dependencies: ['sensible', 'prisma'],
});
