import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

import { ContactService } from '../../../services/contact.js';

const routes: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  const contactService = new ContactService();

  fastify.post<{ Body: { email: string } }>(
    '/',
    {
      schema: {
        tags: ['contact'],
        description: 'Send a contact email from CTA section',
        body: Type.Object({
          email: Type.String({ format: 'email' }),
        }),
        response: {
          200: Type.Object({ success: Type.Boolean(), message: Type.String() }),
          400: Type.Object({ success: Type.Boolean(), message: Type.String() }),
        },
      },
    },
    async (request, reply) => {
      const { email } = request.body;
      try {
        await contactService.sendContactEmail(email);
        return reply.code(200).send({ success: true, message: 'Contact email sent successfully.' });
      } catch (error: any) {
        return reply
          .code(400)
          .send({ success: false, message: error.message || 'Failed to send contact email.' });
      }
    },
  );
};

export default routes;
