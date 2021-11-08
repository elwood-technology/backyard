import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import invariant from 'ts-invariant';

import { getBucket } from '../utils/get-bucket';
import { getCredentials } from '../utils/get-credentials';
import { getProvider } from '../utils/get-provider';

type Next = () => void;
type Options = {};

export default function fastifyState(
  app: FastifyInstance,
  _options: Options,
  next: Next,
) {
  async function handler(
    req: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const { '*': path, bucket: id } = req.params as {
      bucket: string;
      '*': string;
    };

    const bucket = getBucket(id, app.state);
    const provider = getProvider(bucket);
    const credentials = getCredentials(bucket, app.state);

    invariant(credentials, 'Credentials not found');

    const stat = await provider.stat({
      credentials,
      bucket,
      path,
    });

    // const client = await app.pg.connect();

    // const { rows } = await client.query(
    //   'SELECT "n"."service" FROM "zuul"."nodes" as "n" WHERE "user_id" = $1 GROUP BY "n"."service"',
    //   [getUser(req).sub],
    // );

    reply.send(stat);
  }

  app.route({
    method: 'GET',
    url: '/file/:bucket/*',
    handler,
  });

  next();
}
