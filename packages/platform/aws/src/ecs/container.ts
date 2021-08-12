import { join } from 'path';

import type { JsonObject, ServiceHookProviderArgs } from '@backyard/types';
import type { AwsRemoteTerraformHookArgs } from '@backyard/platform-aws';

export async function awsEcsContainerTaskDef(
  args: ServiceHookProviderArgs & AwsRemoteTerraformHookArgs,
): Promise<JsonObject | undefined> {
  const { service, context, state, options } = args;
  const { container } = service;

  if (!container || container?.enabled === false) {
    return;
  }

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
      source: 'github.com/backyardjs/terraform-aws-ecr-image',
      dockerfile_dir: join(context.dir.stage, service.name),
      ecr_repository_url: ecr.attr('repository_url'),
      aws_profile: options.profile,
      aws_region: options.region,
    });

    image = img.attr('ecr_image_url').toString();
  }

  return {
    name: service.name,
    cpu: 9,
    image,
    memory: 9,
    essential: container.essential !== false,
    networkMode: 'awsvpc',
    logConfiguration: {
      logDriver: 'awslogs',
      options: {
        'awslogs-group': 'BackyardLogGroup',
        'awslogs-region': options.region,
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
        containerPort: container.port ?? 5433,
        hostPort: container.port ?? 5433,
      },
    ],
  };
}
