import { join } from 'path';
import { spawn, SpawnOptions } from 'child_process';
import { randomBytes } from 'crypto';

import type {
  AwsRemoteTerraformHookArgs,
  AwsRemoteOptions,
} from '@backyard/platform-aws';
import {
  ConfigurationService,
  Context,
  JsonObject,
  ServiceHookProviderArgs,
} from '@backyard/types';
import {
  ContextModeLocal,
  ContextModeRemote,
  invariant,
} from '@backyard/common';

import { NextJsServiceSettings } from './types';

export function config(
  context: Context,
  config: ConfigurationService<NextJsServiceSettings>,
): Partial<ConfigurationService> {
  invariant(config.settings?.src, 'Must provide settings.src');

  return {
    settings: {},
    gateway: {
      enabled: false,
    },
    container: {
      enabled: true,
      port: 3000,
      host: context.mode === ContextModeRemote ? '0.0.0.0' : '',
      externalPort: context.mode === ContextModeRemote ? 80 : 8080,
      volumes: [[join(context.dir.root, config.settings?.src), '/usr/src/app']],
      environment: {
        NODE_ENV:
          context.mode === ContextModeRemote ? 'production' : 'development',
      },
      build: {
        context: `./${config.name}`,
      },
    },
  };
}

export async function stage(
  args: ServiceHookProviderArgs & { dir: string },
): Promise<void> {
  const { dir, service, context } = args;
  const { filesystem } = context.tools;
  const srcDir = join(context.dir.root, service.settings?.src!);
  const port = service.container?.port ?? 3000;

  if (context.mode == ContextModeLocal) {
    await run('yarn', [], {
      cwd: srcDir,
    });

    await filesystem.writeAsync(
      join(dir, 'Dockerfile'),
      `FROM node:alpine
  ENV PORT ${port}
  WORKDIR /usr/src/app
  EXPOSE ${port}
  CMD [ "yarn", "dev", "-p", "$PORT" ]
    `,
    );

    return;
  }

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

export function run(
  cmd: string,
  args: string[],
  options: SpawnOptions,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, {
      stdio: 'inherit',
      ...options,
    });

    // proc.stdout?.on('data', (data) => {
    //   log(data.toString());
    // });

    // proc.stderr?.on('data', (data) => {
    //   log(data.toString());
    // });

    proc.on('error', reject);
    proc.on('close', resolve);
  });
}

// export async function awsAlb(
//   args: ServiceHookProviderArgs & AwsRemoteTerraformHookArgs,
// ): Promise<void> {
//   const { state, service, context } = args;
//   const { region, profile } = (context.platforms.remote?.getOptions() ??
//     {}) as AwsRemoteOptions;

//   const ecr = state.add(
//     'resource',
//     'aws_ecr_repository',
//     `ecs-${service.name}-ecr`,
//     {
//       name: `backyard_${service.name}`,
//       image_tag_mutability: 'MUTABLE',
//     },
//   );

//   const img = state.add('module', `${service.name}_ecr_image`, {
//     source: 'github.com/elwood-technology/terraform-aws-ecr-image',
//     dockerfile_dir: join(context.dir.stage, service.name),
//     ecr_repository_url: ecr.attr('repository_url'),
//     aws_profile: profile,
//     aws_region: region,
//   });

//   // image = img.attr('ecr_image_url').toString();

// state.add('resource', "aws_lambda_function", "test_lambda", {
//   filename      : "lambda_function_payload.zip"
//   function_name : "lambda_function_name"
//   role          ; aws_iam_role.iam_for_lambda.arn
//   handler       ; "index.test"

//   # The filebase64sha256() function is available in Terraform 0.11.12 and later
//   # For Terraform 0.11.11 and earlier, use the base64sha256() function and the file() function:
//   # source_code_hash = "${base64sha256(file("lambda_function_payload.zip"))}"
//   source_code_hash = filebase64sha256("lambda_function_payload.zip")

//   runtime = "nodejs12.x"

//   environment {
//     variables = {
//       foo = "bar"
//     }
//   }
// }
// }

export async function awsEcsContainerTaskDef(
  _args: ServiceHookProviderArgs & AwsRemoteTerraformHookArgs,
): Promise<JsonObject | undefined> {
  return undefined;

  // const { parent, service, state } = args;
  // const vpc = args.vpc();
  // const listen = state.get('resource', 'aws_alb_listener', 'alb-listen');

  // const target = state.add(
  //   'resource',
  //   'aws_alb_target_group',
  //   'alb-web-target',
  //   {
  //     name: 'BackyardWebTarget',
  //     port: service.container?.port ?? 3000,
  //     protocol: 'HTTP',
  //     vpc_id: vpc?.id,
  //     target_type: 'ip',
  //   },
  // );

  // state.add('resource', 'aws_lb_listener_rule', 'alb-web-listen', {
  //   listener_arn: listen.attr('arn'),
  //   priority: 90,

  //   action: {
  //     type: 'forward',
  //     target_group_arn: target.attr('arn'),
  //   },

  //   condition: {
  //     path_pattern: {
  //       values: ['/*'],
  //     },
  //   },
  // });

  // return parent;
}
