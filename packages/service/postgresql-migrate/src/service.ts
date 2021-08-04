import { EOL } from 'os';
import { join } from 'path';

import { ConfigurationService, ServiceHookProviderArgs } from '@backyard/types';

export function config(
  _config: ConfigurationService,
): Partial<ConfigurationService> {
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
      port: 5433,
      externalPort: 5433,
      build: {
        context: `./db-migrate`,
      },
      environment: {
        POSTGRES_URI: '<%= await context.getService("db").hook("uri") %>',
      },
      meta: {
        dockerCompose: {
          depends_on: ['db'],
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
  const { dir, context } = args;
  const uri = await context.getService('db').hook('uri');
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
cat schema.sql | psql $POSTGRES_URI`,
  );

  const files = [
    [
      '00-schema',
      `
-- Set up reatime
create publication supabase_realtime for all tables;
-- Extension namespacing
create schema extensions;
create extension if not exists "uuid-ossp"      with schema extensions;
create extension if not exists pgcrypto         with schema extensions;
create extension if not exists pgjwt            with schema extensions;
-- Developer roles
create role anon                nologin noinherit;
create role authenticated       nologin noinherit; -- "logged in" user: web_user, app_user, etc
create role service_role        nologin noinherit bypassrls; -- allow developers to create JWT's that bypass their policies
create user authenticator noinherit;
grant anon              to authenticator;
grant authenticated     to authenticator;
grant service_role      to authenticator;
grant usage                     on schema public to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to postgres, anon, authenticated, service_role;`,
    ],
  ];

  for (const [_, service] of context.services) {
    const result = (await service.hook('sql', {})) ?? [];

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
