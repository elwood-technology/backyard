import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export default function register(app: FastifyInstance): void {
  async function handler(
    _req: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    reply.send({
      hello: true,
    });
  }

  app.route({
    method: 'GET',
    url: '/services',
    handler,
  });
}
