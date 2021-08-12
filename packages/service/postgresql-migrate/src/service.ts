import { EOL } from 'os';
import { join } from 'path';

import type {
  ConfigurationService,
  ServiceHookProviderArgs,
  Context,
} from '@backyard/types';
import { invariant } from '@backyard/common';

export function config(
  _context: Context,
  config: ConfigurationService,
): Partial<ConfigurationService> {
  invariant(
    config.settings?.db,
    'Must provide settings.db with name of Database service',
  );

  return {
    settings: {
      user: 'postgres',
      password: 'postgres',
      name: 'backyard',
    },
    gateway: {
      enabled: false,
    },
    container: {
      enabled: true,
      essential: false,
      host: '0.0.0.0',
      build: {
        context: `./${config.name}`,
      },
      environment: {
        POSTGRES_URI: `<%= await context.getService("${config.settings.db}").hook("uri") %>`,
      },
      meta: {
        dockerCompose: {
          depends_on: [config.settings.db],
        },
      },
    },
  };
}

export async function stage(
  args: ServiceHookProviderArgs & {
    dir: string;
  },
): Promise<void> {
  const { dir, context, service } = args;
  const db = service.config.settings?.db;
  const uri = await context.getService(db).hook('uri');
  await context.tools.filesystem.writeAsync(
    join(dir, 'Dockerfile'),
    `
FROM alpine:3.12
RUN apk --no-cache add postgresql-client

COPY schema.sql /var/schema.sql
COPY run.sh /var/run.sh

ARG build_POSTGRES_URI=${uri}
ENV POSTGRES_URI=$build_POSTGRES_URI
WORKDIR /var
CMD ["/bin/sh", "/var/run.sh"]

`,
  );

  await context.tools.filesystem.writeAsync(
    join(dir, 'run.sh'),
    `
# wait-for-postgres.sh
set -e

echo "$POSTGRES_URI"

until PGPASSWORD=$POSTGRES_PASSWORD psql $POSTGRES_URI '\\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up - executing command"
cat schema.sql
cat schema.sql | psql $POSTGRES_URI`,
  );

  const files: string[] = [];

  for (const [_, service] of context.services) {
    const result = (await service.hook('sql', { name: db })) ?? [];

    if (Array.isArray(result)) {
      result.forEach((item) => {
        files.push(item);
      });
    }
  }

  await context.tools.filesystem.writeAsync(
    join(dir, `schema.sql`),
    files.map((item) => item[1]).join(EOL),
  );
}
