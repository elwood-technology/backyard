import type { Context, JsonObject } from '@backyard/types';

import { getServices, getServiceByName } from '@backyard/common';
import type { AwsRemoteTerraformHookArgs } from '@backyard/platform-aws';

export async function addGatewayEcs(
  context: Context,
  args: AwsRemoteTerraformHookArgs,
): Promise<void> {
  const { state } = args;
  const vpc = args.vpc();
  const gateway = getServiceByName('gateway', context);

  const albSecurityGroup = state.add(
    'resource',
    'aws_security_group',
    'gateway-alb',
    {
      name: 'BackyardAlbSecurityGroup',
      description: 'ALB Security Group',
      vpc_id: vpc?.id,
      ingress: {
        protocol: 'tcp',
        from_port: 80,
        to_port: 80,
        cidr_blocks: ['0.0.0.0/0'],
      },
      egress: {
        from_port: 0,
        to_port: 0,
        protocol: '-1',
        cidr_blocks: ['0.0.0.0/0'],
      },
    },
  );

  const publicSubnets = state.get('resource', 'aws_subnet', 'public');

  const alb = state.add('resource', 'aws_alb', 'gateway', {
    name: 'BackyardTestALB',
    subnets: publicSubnets.attr('*.id'),
    security_groups: [albSecurityGroup.id],
  });

  const assumePolicy = state.add(
    'data',
    'aws_iam_policy_document',
    'ecs-assume-policy',
    {
      statement: {
        actions: ['sts:AssumeRole'],

        principals: {
          type: 'Service',
          identifiers: ['ecs-tasks.amazonaws.com'],
        },
      },
    },
  );

  const role = state.add('resource', 'aws_iam_role', 'ecs-task-role', {
    name: 'BackyardEcsTasksServiceRole',
    path: '/',
    assume_role_policy: assumePolicy.attr('json'),
  });

  state.add(
    'resource',
    'aws_iam_role_policy_attachment',
    'ecs-task-role-attachment',
    {
      role: 'BackyardEcsTasksServiceRole',
      policy_arn:
        'arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy',
      depends_on: [role],
    },
  );

  state.add('resource', 'aws_cloudwatch_log_group', 'ecs-log-group', {
    name: 'BackyardLogGroup',
  });

  const cpu = 4096;
  const memory = 8192;
  const taskDef = await createGatewayTaskDef(context, args);

  const _cluster = state.add('resource', 'aws_ecs_cluster', 'ecs-cluster', {
    name: 'Backyard',
  });

  const _task = state.add('resource', 'aws_ecs_task_definition', 'ecs-task', {
    family: 'Backyard',
    network_mode: 'awsvpc',
    requires_compatibilities: ['FARGATE'],
    cpu,
    memory,
    execution_role_arn: role.attr('arn'),
    container_definitions: new state.Heredoc(taskDef),
  });

  const target = state.add('resource', 'aws_alb_target_group', 'alb-target', {
    name: 'BackyardTarget',
    port: gateway?.container?.externalPort,
    protocol: 'HTTP',
    vpc_id: vpc?.id,
    target_type: 'ip',
    health_check: {
      path: '/health',
      port: gateway?.container?.port,
    },
  });

  state.add('resource', 'aws_alb_listener', 'alb-listen', {
    load_balancer_arn: alb.id,
    port: 80,
    protocol: 'HTTP',
    default_action: {
      target_group_arn: target.id,
      type: 'forward',
    },
  });
}

export async function createGatewayTaskDef(
  context: Context,
  args: AwsRemoteTerraformHookArgs,
): Promise<JsonObject[]> {
  const taskDef = [];

  for (const service of getServices(context)) {
    const def = await service.hook('awsEcsContainerTaskDef', {
      ...args,
      service,
    });

    if (def) {
      taskDef.push(def);
    }
  }

  return taskDef;
}
