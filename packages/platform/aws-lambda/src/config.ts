import { relative } from 'path';

import { ContextModeRemote, ContextModeLocal } from '@backyard/common';
import type { ConfigurationService, Context } from '@backyard/types';

import { Settings } from './types';
import { appRoot } from './constants';

export function createFunctionName(config: ConfigurationService): string {
  const settings = config.settings ?? ({} as Settings);
  return (
    settings.functionName ?? `service-${config.name}-v${config.version ?? 1}`
  );
}

export async function config(
  context: Context,
  config: ConfigurationService,
): Promise<Partial<ConfigurationService>> {
  const rel = relative(context.dir.root, context.dir.stage);
  const _cwd = relative(context.dir.root, context.dir.cwd);

  const {
    key = undefined,
    secret,
    region,
    keepalive = 60000,
    timeout = 60000,
    port = 3000,
  } = (config.settings ?? {}) as Settings;

  if (context.mode === ContextModeRemote) {
    return {
      gateway: {
        enabled: true,
        plugins: [
          {
            name: 'aws-lambda',
            config: {
              ...(key ? { aws_key: key } : {}),
              ...(secret ? { aws_secret: secret } : {}),
              ...(region ? { aws_region: region } : {}),
              function_name: createFunctionName(config),
              keepalive,
              timeout,
              forward_request_body: true,
              forward_request_headers: true,
              forward_request_method: true,
              forward_request_uri: true,
              is_proxy_integration: true,
              log_type: 'Tail',
              invocation_type: 'RequestResponse',
            },
          },
        ],
      },
      container: {
        enabled: false,
      },
    };
  }

  return {
    gateway: {
      enabled: true,
    },
    container: {
      enabled: true,
      imageName: 'node',
      port: 3000,
      externalPort: port,
      host:
        context.mode === ContextModeLocal ? config.container?.name : '0.0.0.0',
      environment: {},
      meta: {
        dockerCompose: {
          command: ['node', 'index.js'],
          volumes: [`${context.dir.root}:${appRoot}`],
          working_dir: `${appRoot}/${rel}/${config.name}`,
        },
      },
    },
  };
}
