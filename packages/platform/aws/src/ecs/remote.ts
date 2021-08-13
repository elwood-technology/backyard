import type { ServiceHookProviderArgs } from '@backyard/types';

import type { AwsRemoteTerraformHookArgs } from '../types';
import { addGatewayEcs } from './gateway';

export async function aws(
  args: ServiceHookProviderArgs & AwsRemoteTerraformHookArgs,
): Promise<void> {
  const { context, service } = args;

  if (service.name === 'gateway') {
    return addGatewayEcs(context, args);
  }

  return;
}

export { awsEcsContainerTaskDef } from './container';

// export async function terraform(
//   context: Context,
//   { tf, Function, Argument, Map, Heredoc }: TerraformHookArgs,
// ): Promise<void> {
//   const gateway = getServiceByName('gateway', context);
//   const profile = 'elwood';
//   const region = 'us-west-1';

//   tf.provider('aws', {
//     region: region,
//     profile: profile,
//   });

//   const az = tf.data('aws_availability_zones', 'available', {
//     state: 'available',
//   });

//   const vpc = tf.resource('aws_vpc', 'backyard--vpc', {
//     cidr_block: '10.120.0.0/16',
//     enable_dns_support: true,
//     enable_dns_hostnames: true,
//     tags: new Map({
//       Name: 'backyard--vpc',
//     }),
//   });

//   const privateSubnets = tf.resource(
//     'aws_subnet',
//     'backyard--vpc-subnet-private',
//     {
//       count: 2,
//       cidr_block: new Function(
//         'cidrsubnet',
//         vpc.attr('cidr_block'),
//         8,
//         new Argument('count.index'),
//       ),
//       availability_zone: az.attr('names[count.index]'),
//       vpc_id: vpc.id,
//       tags: new Map({
//         Name: 'backyard--vpc-subnet-private-${count.index}',
//       }),
//     },
//   );

//   const publicSubnets = tf.resource(
//     'aws_subnet',
//     'backyard--vpc-subnet-public',
//     {
//       count: 2,
//       cidr_block: new Function(
//         'cidrsubnet',
//         vpc.attr('cidr_block'),
//         8,
//         new Argument('2 + count.index'),
//       ),
//       availability_zone: az.attr('names[count.index]'),
//       vpc_id: vpc.id,
//       tags: new Map({
//         Name: 'backyard--vpc-subnet-public-${count.index}',
//       }),
//     },
//   );

//   const ig = tf.resource('aws_internet_gateway', 'backyard--vpc-ig', {
//     vpc_id: vpc.id,
//     tags: new Map({
//       Name: 'backyard--vpc-ig',
//     }),
//   });

//   tf.resource('aws_route', 'backyard--vpc-public-route', {
//     route_table_id: vpc.attr('main_route_table_id'),
//     destination_cidr_block: '0.0.0.0/0',
//     gateway_id: ig.id,
//   });

//   const eip = tf.resource('aws_eip', 'backyard--vpc-eip', {
//     count: 2,
//     vpc: true,
//     depends_on: [ig],
//     tags: new Map({
//       Name: 'backyard--vpc-eip-${count.index}',
//     }),
//   });

//   const nat = tf.resource('aws_nat_gateway', 'backyard--vpc-nat', {
//     count: 2,
//     subnet_id: new Function(
//       'element',
//       publicSubnets.attr('*.id'),
//       new Argument('count.index'),
//     ),
//     allocation_id: new Function(
//       'element',
//       eip.attr('*.id'),
//       new Argument('count.index'),
//     ),
//     tags: new Map({
//       Name: 'backyard--vpc-nat-${count.index}',
//     }),
//   });

//   const privateRouteTable = tf.resource(
//     'aws_route_table',
//     'private-route-table',
//     {
//       count: 2,
//       vpc_id: vpc.id,
//       route: {
//         cidr_block: '0.0.0.0/0',
//         nat_gateway_id: new Function(
//           'element',
//           nat.attr('*.id'),
//           new Argument('count.index'),
//         ),
//       },
//       tags: new Map({
//         Name: 'backyard--vpc-private-route-table-${count.index}',
//       }),
//     },
//   );

//   tf.resource('aws_route_table_association', 'route-association', {
//     count: 2,
//     subnet_id: new Function(
//       'element',
//       privateSubnets.attr('*.id'),
//       new Argument('count.index'),
//     ),

//     route_table_id: new Function(
//       'element',
//       privateRouteTable.attr('*.id'),
//       new Argument('count.index'),
//     ),
//   });

//   const albSecurityGroup = tf.resource(
//     'aws_security_group',
//     'backyard--alb-sg',
//     {
//       name: 'BackyardAlbSecurityGroup',
//       description: 'ALB Security Group',
//       vpc_id: vpc.id,

//       ingress: {
//         protocol: 'tcp',
//         from_port: 80,
//         to_port: 80,
//         cidr_blocks: ['0.0.0.0/0'],
//       },

//       egress: {
//         from_port: 0,
//         to_port: 0,
//         protocol: '-1',
//         cidr_blocks: ['0.0.0.0/0'],
//       },
//     },
//   );

//   const alb = tf.resource('aws_alb', 'alb', {
//     name: 'BackyardTestALB',
//     subnets: publicSubnets.attr('*.id'),
//     security_groups: [albSecurityGroup.id],
//   });

//   const r = tf.data('aws_iam_policy_document', 'backyard--ecs-assume-policy', {
//     statement: {
//       actions: ['sts:AssumeRole'],

//       principals: {
//         type: 'Service',
//         identifiers: ['ecs-tasks.amazonaws.com'],
//       },
//     },
//   });

//   const role = tf.resource('aws_iam_role', 'backyard--ecs-task-role', {
//     name: 'BackyardEcsTasksServiceRole',
//     path: '/',
//     assume_role_policy: r.attr('json'),
//   });

//   tf.resource(
//     'aws_iam_role_policy_attachment',
//     'backyard--ecs-task-role-attachment',
//     {
//       role: 'BackyardEcsTasksServiceRole',
//       policy_arn:
//         'arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy',
//       depends_on: [role],
//     },
//   );

//   tf.resource('aws_cloudwatch_log_group', 'backyard--ecs-log-group', {
//     name: 'BackyardLogGroup',
//   });

//   const services = getServices(context);
//   const cpu = 4096;
//   const memory = 8192;

//   const state: AwsEcsTerraformState = {
//     profile,
//     region,
//     vpc,
//     privateSubnets,
//     publicSubnets,
//     alb,
//     albSecurityGroup,
//   };

//   const taskDef: JsonObject[] = [
//     ...services.map((service) => {
//       return ecsContainer(
//         context,
//         service,
//         tf,
//         state,
//         Math.floor(cpu / services.length),
//         Math.floor(memory / services.length),
//       );
//     }),
//   ].filter(Boolean) as JsonObject[];

//   const cluster = tf.resource('aws_ecs_cluster', 'backyard--ecs-cluster', {
//     name: 'Backyard',
//   });

//   const task = tf.resource('aws_ecs_task_definition', 'backyard--ecs-task', {
//     family: 'Backyard',
//     network_mode: 'awsvpc',
//     requires_compatibilities: ['FARGATE'],
//     cpu,
//     memory,
//     execution_role_arn: role.attr('arn'),
//     container_definitions: new Heredoc(taskDef),
//   });

//   const target = tf.resource('aws_alb_target_group', 'backyard--alb-target', {
//     name: 'BackyardTarget',
//     port: gateway?.container?.externalPort,
//     protocol: 'HTTP',
//     vpc_id: vpc.id,
//     target_type: 'ip',
//     health_check: {
//       path: '/health',
//       port: gateway?.container?.port,
//     },
//   });

//   tf.resource('aws_alb_listener', 'backyard--alb-listen', {
//     load_balancer_arn: alb.id,
//     port: 80,
//     protocol: 'HTTP',
//     default_action: {
//       target_group_arn: target.id,
//       type: 'forward',
//     },
//   });

//   const securityGroup = tf.resource('aws_security_group', 'backyard--kong-sg', {
//     name: 'BackyardKongSecurityGroup',
//     description: 'ALB Security Group',
//     vpc_id: vpc.id,

//     ingress: {
//       protocol: 'tcp',
//       from_port: gateway?.container?.port,
//       to_port: gateway?.container?.port,
//       security_groups: [albSecurityGroup.id],
//     },

//     egress: {
//       from_port: 0,
//       to_port: 0,
//       protocol: '-1',
//       cidr_blocks: ['0.0.0.0/0'],
//     },
//   });

//   tf.resource('aws_ecs_service', 'backyard--ecs-service', {
//     name: 'Backyard',
//     cluster: cluster.id,
//     task_definition: task.id,
//     desired_count: 1,
//     launch_type: 'FARGATE',
//     network_configuration: {
//       security_groups: [securityGroup.id],
//       subnets: privateSubnets.attr('*.id'),
//     },
//     load_balancer: {
//       target_group_arn: target.id,
//       container_name: 'gateway',
//       container_port: gateway?.container?.port,
//     },
//     depends_on: [alb],
//   });

//   const args = createTerraformHookArgs<AwsEcsTerraformHookArgs>({
//     state,
//     tf,
//   });

//   for (const service of services) {
//     await service.hook('terraformAwsEcs', args);
//   }
// }

// export function ecsContainer(
//   context: Context,
//   service: ContextService,
//   tf: TerraformGenerator,
//   state: AwsEcsTerraformState,
//   cpu: number,
//   memory: number,
// ): JsonObject | boolean {
//   const { container } = service;

//   if (!container || container?.enabled === false) {
//     return false;
//   }

//   let image = container.imageName;

//   if (container.build) {
//     const ecr = tf.resource(
//       'aws_ecr_repository',
//       `backyard--${service.name}-ecr`,
//       {
//         name: `backyard_${service.name}`,
//         image_tag_mutability: 'MUTABLE',
//       },
//     );

//     const img = tf.module(`${service.name}_ecr_image`, {
//       source: 'github.com/backyardjs/terraform-aws-ecr-image',
//       dockerfile_dir: join(context.dir.stage, service.name),
//       ecr_repository_url: ecr.attr('repository_url'),
//       aws_profile: state.profile,
//       aws_region: state.region,
//     });

//     image = img.attr('ecr_image_url').toString();
//   }

//   return {
//     name: service.name,
//     cpu,
//     image,
//     memory,
//     essential: container.essential !== false,
//     networkMode: 'awsvpc',
//     logConfiguration: {
//       logDriver: 'awslogs',
//       options: {
//         'awslogs-group': 'BackyardLogGroup',
//         'awslogs-region': state.region,
//         'awslogs-stream-prefix': service.name,
//       },
//     },
//     environment: Object.entries(container.environment ?? {}).map(
//       ([name, value]) => {
//         return {
//           name,
//           value,
//         };
//       },
//     ),
//     portMappings: [
//       {
//         containerPort: container.port ?? 5433,
//         hostPort: container.port ?? 5433,
//       },
//     ],
//   };
// }
