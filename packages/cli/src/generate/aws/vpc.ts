import {
  TerraformGenerator,
  Function,
  Argument,
  Map,
} from 'terraform-generator';

import { InfrastructureState } from '../../types';

export function vpcInfrastructure(
  tf: TerraformGenerator,
): Pick<InfrastructureState, 'vpc' | 'subnets'> {
  const az = tf.data('aws_availability_zones', 'available', {
    state: 'available',
  });

  const vpc = tf.resource('aws_vpc', 'backyard--vpc', {
    cidr_block: '10.120.0.0/16',
    enable_dns_support: true,
    enable_dns_hostnames: true,
    tags: new Map({
      Name: 'backyard--vpc',
    }),
  });

  const privateSubnets = tf.resource(
    'aws_subnet',
    'backyard--vpc-subnet-private',
    {
      count: 2,
      cidr_block: new Function(
        'cidrsubnet',
        vpc.attr('cidr_block'),
        8,
        new Argument('count.index'),
      ),
      availability_zone: az.attr('names[count.index]'),
      vpc_id: vpc.id,
      tags: new Map({
        Name: 'backyard--vpc-subnet-private-${count.index}',
      }),
    },
  );

  const publicSubnets = tf.resource(
    'aws_subnet',
    'backyard--vpc-subnet-public',
    {
      count: 2,
      cidr_block: new Function(
        'cidrsubnet',
        vpc.attr('cidr_block'),
        8,
        new Argument('2 + count.index'),
      ),
      availability_zone: az.attr('names[count.index]'),
      vpc_id: vpc.id,
      tags: new Map({
        Name: 'backyard--vpc-subnet-public-${count.index}',
      }),
    },
  );

  const ig = tf.resource('aws_internet_gateway', 'backyard--vpc-ig', {
    vpc_id: vpc.id,
    tags: new Map({
      Name: 'backyard--vpc-ig',
    }),
  });

  tf.resource('aws_route', 'backyard--vpc-public-route', {
    route_table_id: vpc.attr('main_route_table_id'),
    destination_cidr_block: '0.0.0.0/0',
    gateway_id: ig.id,
  });

  const eip = tf.resource('aws_eip', 'backyard--vpc-eip', {
    count: 2,
    vpc: true,
    depends_on: [ig],
    tags: new Map({
      Name: 'backyard--vpc-eip-${count.index}',
    }),
  });

  const nat = tf.resource('aws_nat_gateway', 'backyard--vpc-nat', {
    count: 2,
    subnet_id: new Function(
      'element',
      publicSubnets.attr('*.id'),
      new Argument('count.index'),
    ),
    allocation_id: new Function(
      'element',
      eip.attr('*.id'),
      new Argument('count.index'),
    ),
    tags: new Map({
      Name: 'backyard--vpc-nat-${count.index}',
    }),
  });

  const privateRouteTable = tf.resource(
    'aws_route_table',
    'private-route-table',
    {
      count: 2,
      vpc_id: vpc.id,
      route: {
        cidr_block: '0.0.0.0/0',
        nat_gateway_id: new Function(
          'element',
          nat.attr('*.id'),
          new Argument('count.index'),
        ),
      },
      tags: new Map({
        Name: 'backyard--vpc-private-route-table-${count.index}',
      }),
    },
  );

  tf.resource('aws_route_table_association', 'route-association', {
    count: 2,
    subnet_id: new Function(
      'element',
      privateSubnets.attr('*.id'),
      new Argument('count.index'),
    ),

    route_table_id: new Function(
      'element',
      privateRouteTable.attr('*.id'),
      new Argument('count.index'),
    ),
  });

  return {
    vpc,
    subnets: {
      private: privateSubnets,
      public: publicSubnets,
    },
  };
}
