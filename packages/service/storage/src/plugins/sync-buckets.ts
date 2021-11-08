import { FastifyInstance } from 'fastify';

type Next = () => void;
type Options = {};

export async function syncBuckets(app: FastifyInstance): Promise<void> {
  const client = await app.pg.connect();

  for (const bucket of app.state.buckets) {
    const { id, displayName, provider, credential, ...attributes } = bucket;

    client.query(
      `
      INSERT INTO "storage"."buckets"
        (id, display_name, provider, credentials, attributes)
      VALUES
        ($1, $2, $3, $4, $5)
      ON CONFLICT ("id") DO UPDATE SET
        display_name = $2, provider = $3, credentials = $4, attributes = $5
    `,
      [id, displayName, provider, credential, JSON.stringify(attributes)],
    );
  }
}

export default function syncBucketsPlugin(
  app: FastifyInstance,
  _options: Options,
  next: Next,
) {
  syncBuckets(app).finally(() => next());
}
