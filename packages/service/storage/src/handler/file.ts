import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import invariant from 'ts-invariant';

import { getBucket } from '../library/get-bucket';
import { getCredentials } from '../library/get-credentials';
import { getProvider } from '../library/get-provider';
import { hasAccess } from '../library/access';
import { normalizeFilePath } from '../library/normalize-path';

type Next = () => void;
type Options = {};

export default function fastifyHandleFile(
  app: FastifyInstance,
  _options: Options,
  next: Next,
) {
  async function handler(
    req: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const { '*': rawPath, bucket: id } = req.params as {
      bucket: string;
      '*': string;
    };

    const path = normalizeFilePath(rawPath);
    const bucket = getBucket(id, app.state);
    const provider = getProvider(bucket, app.state);
    const credentials = getCredentials(bucket, app.state);

    invariant(credentials, 'Credentials not found');

    const access = await hasAccess({
      req,
      bucket,
      path: path,
      type: 'file',
    });

    if (!access) {
      reply.code(404);
      reply.send({
        code: 404,
        error: 'Not found',
      });
      return;
    }

    const stat = await provider.stat({
      credentials,
      bucket,
      path,
    });

    reply.send(stat);
  }

  app.route({
    method: 'GET',
    url: '/file/:bucket/*',
    handler,
  });

  next();
}
