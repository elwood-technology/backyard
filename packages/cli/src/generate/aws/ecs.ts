import type { Resource } from 'terraform-generator';
import { Heredoc } from 'terraform-generator';

import type { Context } from '@backyard/types';

import { EcrTaskDefinition, InfrastructureState } from '../../types';
import { kongInfrastructure } from '../kong';
import { authInfrastructure } from '../auth';
import { realtimeInfrastructure } from '../realtime';
import { restInfrastructure } from '../rest';
import { dbInfrastructure } from '../db';

export function ecsInfrastructure(
  context: Context,
  state: InfrastructureState,
): Resource {
  const { tf, alb, vpc, subnets, albSecurityGroup } = state;
  const { kong } = context.coreServiceSettings;

  const r = tf.data('aws_iam_policy_document', 'backyard--ecs-assume-policy', {
    statement: {
      actions: ['sts:AssumeRole'],

      principals: {
        type: 'Service',
        identifiers: ['ecs-tasks.amazonaws.com'],
      },
    },
  });

  const role = tf.resource('aws_iam_role', 'backyard--ecs-task-role', {
    name: 'BackyardEcsTasksServiceRole',
    path: '/',
    assume_role_policy: r.attr('json'),
  });

  tf.resource(
    'aws_iam_role_policy_attachment',
    'backyard--ecs-task-role-attachment',
    {
      role: 'BackyardEcsTasksServiceRole',
      policy_arn:
        'arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy',
      depends_on: [role],
    },
  );

  const taskDef: EcrTaskDefinition[] = [
    kongInfrastructure(context, state),
    authInfrastructure(context, state),
    realtimeInfrastructure(context, state),
    restInfrastructure(context, state),
    dbInfrastructure(context, state),
  ];

  const cluster = tf.resource('aws_ecs_cluster', 'backyard--ecs-cluster', {
    name: 'Backyard',
  });

  const task = tf.resource('aws_ecs_task_definition', 'backyard--ecs-task', {
    family: 'Backyard',
    network_mode: 'awsvpc',
    requires_compatibilities: ['FARGATE'],
    cpu: 1024 * taskDef.length,
    memory: 2048 * taskDef.length,
    execution_role_arn: role.attr('arn'),
    container_definitions: new Heredoc(taskDef),
  });

  const target = tf.resource('aws_alb_target_group', 'backyard--alb-target', {
    name: 'BackyardTarget',
    port: kong.port,
    protocol: 'HTTP',
    vpc_id: vpc.id,
    target_type: 'ip',
    health_check: {
      path: '/health',
      port: kong.containerPort,
    },
  });

  tf.resource('aws_alb_listener', 'backyard--alb-listen', {
    load_balancer_arn: alb.id,
    port: 80,
    protocol: 'HTTP',
    default_action: {
      target_group_arn: target.id,
      type: 'forward',
    },
  });

  const securityGroup = tf.resource('aws_security_group', 'backyard--kong-sg', {
    name: 'BackyardKongSecurityGroup',
    description: 'ALB Security Group',
    vpc_id: vpc.id,

    ingress: {
      protocol: 'tcp',
      from_port: kong.port,
      to_port: kong.containerPort,
      security_groups: [albSecurityGroup.id],
    },

    egress: {
      from_port: 0,
      to_port: 0,
      protocol: '-1',
      cidr_blocks: ['0.0.0.0/0'],
    },
  });

  return tf.resource('aws_ecs_service', 'backyard--ecs-service', {
    name: 'Backyard',
    cluster: cluster.id,
    task_definition: task.id,
    desired_count: 1,
    launch_type: 'FARGATE',
    network_configuration: {
      security_groups: [securityGroup.id],
      subnets: subnets.private.attr('*.id'),
    },
    load_balancer: {
      target_group_arn: target.id,
      container_name: 'kong',
      container_port: kong.containerPort,
    },
    depends_on: [alb],
  });
}
