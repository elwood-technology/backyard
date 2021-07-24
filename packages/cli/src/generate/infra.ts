import { TerraformGenerator } from 'terraform-generator';

import type { Context } from '@backyard/types';

import { InfrastructureState } from '../types';
import * as aws from './aws';

export function infraConfigs(context: Context): void {
  const tf = new TerraformGenerator();

  tf.provider('aws', {
    region: 'us-west-1',
    profile: 'elwood',
  });

  const { vpc, subnets } = aws.vpcInfrastructure(tf);
  const { alb, albSecurityGroup } = aws.albInfrastructure(tf, { vpc, subnets });
  const logGroup = tf.resource('aws_cloudwatch_log_group', 'this', {
    name: 'BackyardLogGroup',
    retention_in_days: 1,
  });

  const state: InfrastructureState = {
    region: 'us-west-1',
    logGroup,
    profile: 'elwood',
    tf,
    alb,
    vpc,
    albSecurityGroup,
    subnets,
  };

  aws.ecsInfrastructure(context, state);

  tf.write({
    dir: context.dir.dest,
    format: true,
  });
}
