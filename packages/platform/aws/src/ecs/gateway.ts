import type { Context, JsonObject } from '@backyard/types';
import { getServices, getServiceByName } from '@backyard/common';

import type { AwsRemoteTerraformHookArgs } from '../types';

export async function addGatewayEcs(
  context: Context,
  args: AwsRemoteTerraformHookArgs,
): Promise<void> {
  const { state } = args;
  const vpc = args.vpc();
  const alb = args.alb();
  const gateway = getServiceByName('gateway', context);

  const privateSubnets = state.get('resource', 'aws_subnet', 'private');

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

  const cluster = state.add('resource', 'aws_ecs_cluster', 'ecs-cluster', {
    name: 'Backyard',
  });

  const task = state.add('resource', 'aws_ecs_task_definition', 'ecs-task', {
    family: 'Backyard',
    network_mode: 'awsvpc',
    requires_compatibilities: ['FARGATE'],
    cpu,
    memory,
    execution_role_arn: role.attr('arn'),
    container_definitions: new state.Heredoc(taskDef),
  });

  const routePrefix = gateway.settings.routePrefix || '';
  const target = state.add('resource', 'aws_alb_target_group', 'alb-target', {
    name: 'BackyardGatewayTarget',
    port: gateway?.container?.port,
    protocol: 'HTTP',
    vpc_id: vpc?.id,
    target_type: 'ip',
    health_check: {
      path: `/${routePrefix}health`,
      port: gateway?.container?.port,
      unhealthy_threshold: 5,
      interval: 60,
    },
  });
  state.add('resource', 'aws_lb_listener_rule', 'alb-ecs-target', {
    listener_arn: state
      .get('resource', 'aws_alb_listener', `default-listen`)
      .attr('arn'),
    priority: 9999,

    action: {
      type: 'forward',
      target_group_arn: target.attr('arn'),
    },

    condition: {
      path_pattern: {
        values: [`/${routePrefix}*`],
      },
    },
  });

  const securityGroup = state.add(
    'resource',
    'aws_security_group',
    'gatway-sg',
    {
      name: 'BackyardKongSecurityGroup',
      description: 'ALB Security Group',
      vpc_id: vpc?.id,

      ingress: {
        protocol: 'tcp',
        from_port: 0,
        to_port: 65535,
        security_groups: [
          state.get('resource', 'aws_security_group', 'default').id,
        ],
      },

      egress: {
        from_port: 0,
        to_port: 65535,
        protocol: 'tcp',
        cidr_blocks: ['0.0.0.0/0'],
      },
    },
  );

  const loadBalancer: JsonObject[] = [
    {
      target_group_arn: target.attr('arn'),
      container_name: 'gateway',
      container_port: gateway?.container?.port,
    },
  ];

  for (const service of getServices(context)) {
    const result = await service.hook('awsEcsServiceLoadBalancer', {
      ...args,
      service,
    });

    if (result && Object.keys(result).length > 0) {
      loadBalancer.push(result);
    }
  }

  state.add('resource', 'aws_ecs_service', 'ecs-service', {
    name: 'Backyard',
    cluster: cluster.id,
    task_definition: task.id,
    desired_count: 1,
    launch_type: 'FARGATE',
    network_configuration: {
      security_groups: [securityGroup.id],
      subnets: privateSubnets.attr('*.id'),
    },
    load_balancer: loadBalancer,
    depends_on: [alb],
  });

  for (const service of getServices(context)) {
    await service.hook('awsAlb', {
      ...args,
      service,
    });
  }
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
