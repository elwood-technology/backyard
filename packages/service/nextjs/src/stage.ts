import { join, relative } from 'path';
import { randomBytes } from 'crypto';

import { ServiceHookProviderArgs } from '@backyard/types';
import { ContextModeLocal, debug, invariant } from '@backyard/common';

import { run } from './util';

const log = debug('backyard:service:nextjs:stage');

export async function stage(
  args: ServiceHookProviderArgs & { dir: string },
): Promise<void> {
  const { dir, service, context } = args;
  const { filesystem } = context.tools;
  const srcDir = join(context.dir.root, service.settings?.src!);
  const port = service.container?.port ?? 3000;

  if (context.mode == ContextModeLocal) {
    log(`running yarn in src dir ${srcDir}`);

    invariant(
      filesystem.exists(join(srcDir, 'package.json')),
      `No "package.json" in "${srcDir}"`,
    );

    const hasYarnLock = filesystem.exists(join(srcDir, 'yarn.lock'));
    const contextDir = service.settings?.context ?? service.settings?.src;
    const rel = relative(contextDir, srcDir);

    await filesystem.writeAsync(
      join(dir, 'Dockerfile'),
      [
        `FROM node:alpine`,
        `RUN apk add --no-cache libc6-compat`,
        `RUN mkdir -p /app/src`,
        `COPY ${rel}/package.json /app`,
        hasYarnLock && `COPY ${rel}/yarn.lock /app`,
        `RUN cd /app && yarn install && ls`,
        `ENV NODE_PATH /app/node_modules`,
        `WORKDIR ${join('/app/src/', rel)}`,
        `EXPOSE ${port}`,
        `CMD [ "/app/node_modules/.bin/next", "dev", "-p", "${port}" ]`,
      ]
        .filter(Boolean)
        .join('\n'),
    );

    return;
  }

  await stageRemote(args);
}

export async function stageRemote(
  args: ServiceHookProviderArgs & { dir: string },
): Promise<void> {
  const { dir, service, context } = args;
  const { filesystem } = context.tools;
  const srcDir = join(context.dir.root, service.settings?.src!);
  const port = service.container?.port ?? 3000;

  const buildTag = `build-${service.name}-${randomBytes(5).toString('hex')}`;
  const hasNextConfig = filesystem.exists(join(dir, 'next.config.js'));

  await filesystem.dirAsync(join(srcDir, 'public'));

  await filesystem.writeAsync(
    join(srcDir, 'Dockerfile'),
    `# Install dependencies only when needed
FROM node:alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Rebuild the source code only when needed
FROM node:alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN yarn build && yarn install --production --ignore-scripts --prefer-offline

# Production image, copy all the files and run next
FROM node:alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001


${hasNextConfig ? 'COPY --from=builder /app/next.config.js ./' : ''}
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/yarn.lock ./yarn.lock
`,
  );

  await run('docker', ['build', '-t', buildTag, '.'], {
    cwd: srcDir,
  });

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
