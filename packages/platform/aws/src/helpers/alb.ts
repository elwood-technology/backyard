import { AwsRemoteTerraformHookArgs } from '../types';

export function addAlb(args: AwsRemoteTerraformHookArgs): void {
  const { state, options } = args;

  if (!options.alb) {
    return;
  }

  const vpc = args.vpc();
  const albs = Array.isArray(options.alb) ? options.alb : [options.alb];

  for (const item of albs) {
    const albSecurityGroup = state.add(
      'resource',
      'aws_security_group',
      item.name,
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

    const alb = state.add('resource', 'aws_alb', item.name, {
      name: 'BackyardTestALB',
      subnets: publicSubnets.attr('*.id'),
      security_groups: [albSecurityGroup.id],
    });

    state.add('resource', 'aws_alb_listener', `${item.name}-listen`, {
      load_balancer_arn: alb.id,
      port: 80,
      protocol: 'HTTP',
      default_action: {
        type: 'fixed-response',
        fixed_response: {
          content_type: 'text/plain',
          message_body: ':)',
          status_code: '200',
        },
      },
    });
  }
}
