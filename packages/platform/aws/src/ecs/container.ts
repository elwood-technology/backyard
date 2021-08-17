import { join } from 'path';

import type { JsonObject, ServiceHookProviderArgs } from '@backyard/types';

import { invariant } from '@backyard/common';

import type { AwsRemoteTerraformHookArgs, AwsRemoteOptions } from '../types';
import { getServices } from 'packages/common/src/service';

export async function awsEcsContainerTaskDef(
  args: ServiceHookProviderArgs & AwsRemoteTerraformHookArgs,
): Promise<JsonObject | undefined> {
  const { service, context, state } = args;
  const { container } = service;

  if (!container || container?.enabled === false) {
    return;
  }

  const { ecs, region, profile } = (context.platforms.remote?.getOptions() ??
    {}) as AwsRemoteOptions;
  const clusters = ecs?.clusters ?? [];
  const numberOfServices = getServices(context).length - 1;

  invariant(
    container.port,
    `Service "${service.name}" does not have a "container.port". This is required for ECS Containers`,
  );

  const {
    cluster: clusterName,
    containerCpu = 100 / numberOfServices / 100,
    containerMemory = 0,
  } = service.platform?.getOptions() ?? {};

  const cluster = clusters.find((item) => item.name === clusterName) ?? {
    cpu: 256,
    memory: 512,
  };
  const cpu = Math.floor(cluster.cpu * containerCpu);
  const memory = Math.floor(cluster.memory * containerMemory);

  let image = container.imageName;

  if (container.build) {
    const ecr = state.add(
      'resource',
      'aws_ecr_repository',
      `ecs-${service.name}-ecr`,
      {
        name: `backyard_${service.name}`,
        image_tag_mutability: 'MUTABLE',
      },
    );

    const img = state.add('module', `${service.name}_ecr_image`, {
      source: 'github.com/elwood-technology/terraform-aws-ecr-image',
      dockerfile_dir: join(context.dir.stage, service.name),
      ecr_repository_url: ecr.attr('repository_url'),
      aws_profile: profile,
      aws_region: region,
    });

    image = img.attr('ecr_image_url').toString();
  }

  return {
    name: service.name,
    cpu,
    image,
    memory,
    essential: container.essential !== false,
    networkMode: 'awsvpc',
    logConfiguration: {
      logDriver: 'awslogs',
      options: {
        'awslogs-group': 'BackyardLogGroup',
        'awslogs-region': region,
        'awslogs-stream-prefix': service.name,
      },
    },
    environment: Object.entries(container.environment ?? {}).map(
      ([name, value]) => {
        return {
          name: String(name),
          value: String(value),
        };
      },
    ),
    portMappings: [
      {
        containerPort: container.port,
        hostPort: container.port,
      },
    ],
  };
}
