import { join, relative } from 'path';
import { randomBytes } from 'crypto';

import { ServiceHookProviderArgs } from '@backyard/types';
import { ContextModeLocal } from '@backyard/common';

import { run } from './util';

export async function stage(
  args: ServiceHookProviderArgs & { dir: string },
): Promise<void> {
  if (args.context.mode == ContextModeLocal) {
    return;
  }

  const { dir, service, context } = args;
  const { filesystem } = context.tools;
  const srcDir = join(context.dir.root, service.settings?.src!);
  const port = service.container?.port ?? 3000;

  const buildTag = `build-${service.name}-${randomBytes(5).toString('hex')}`;
  const hasNextConfig = filesystem.exists(join(dir, 'next.config.js'));
  const _hasYarnLock = filesystem.exists(join(dir, 'yarn.lock'));

  const relDir = relative(context.dir.root, service.settings?.src);

  await filesystem.dirAsync(join(srcDir, 'public'));

  await filesystem.writeAsync(
    join(context.dir.root, '.dockerignore'),
    '**/node_modules',
  );

  await filesystem.writeAsync(
    join(dir, 'Dockerfile'),
    `
# Rebuild the source code only when needed
FROM node:alpine AS builder
WORKDIR /app
COPY . .
RUN cd /app/${relDir} && yarn install
RUN cd /app/${relDir} && yarn build

# Production image, copy all the files and run next
FROM node:alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nxtjs -u 1001

${hasNextConfig ? `COPY --from=builder /app/${relDir}/next.config.js ./` : ''}
COPY --from=builder /app/${relDir}/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/${relDir}/.next ./.next
COPY --from=builder /app/${relDir}/package.json ./package.json
COPY --from=builder /app/yarn.lock ./yarn.lock

# we remove the dev dependencies from the package.json if they exist
# just in case there are any local dependencies that can't be resolved
RUN awk '/},/ { p = 0 } { if (!p) { print $0 } } /"devDependencies":/ { p = 1 }' package.json > package.json.tmp && mv package.json.tmp package.json \
    && yarn install --production --ignore-scripts --frozen-lockfile
`,
  );

  await run(
    'docker',
    ['build', '-t', buildTag, '-f', join(dir, 'Dockerfile'), '.'],
    {
      cwd: context.dir.root,
    },
  );

  await run('docker', ['create', `--name=${buildTag}`, buildTag], {
    cwd: srcDir,
  });

  await run('docker', ['cp', `${buildTag}:/app/.`, join(dir)], {
    cwd: srcDir,
  });

  await run('docker', ['rm', '-f', '-v', buildTag], {
    cwd: srcDir,
  });

  await run('docker', ['rmi', '-f', buildTag], {
    cwd: srcDir,
  });

  await filesystem.writeAsync(
    join(dir, 'Dockerfile'),
    `FROM node:alpine AS deps

RUN apk add --no-cache libc6-compat
WORKDIR /app

FROM node:alpine AS builder
WORKDIR /app
COPY . .

FROM node:alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT ${port}

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001


${hasNextConfig ? 'COPY --from=builder /app/next.config.js ./' : ''}
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/yarn.lock ./yarn.lock

USER nextjs

EXPOSE ${port}


ENV NEXT_TELEMETRY_DISABLED 1

CMD ["yarn", "start", "-p", "$PORT"]
`,
  );
}
