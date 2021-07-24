import { TerraformGenerator } from 'terraform-generator';

import { InfrastructureState } from '../../types';

export function albInfrastructure(
  tf: TerraformGenerator,
  state: Pick<InfrastructureState, 'vpc' | 'subnets'>,
): Pick<InfrastructureState, 'alb' | 'albSecurityGroup'> {
  const { vpc, subnets } = state;
  const albSecurityGroup = tf.resource(
    'aws_security_group',
    'backyard--alb-sg',
    {
      name: 'BackyardAlbSecurityGroup',
      description: 'ALB Security Group',
      vpc_id: vpc.id,

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

  const alb = tf.resource('aws_alb', 'alb', {
    name: 'BackyardTestALB',
    subnets: subnets.public.attr('*.id'),
    security_groups: [albSecurityGroup.id],
  });

  return { alb, albSecurityGroup };
}
