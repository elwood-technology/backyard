import { AwsRemoteTerraformHookArgs } from '../types';

export function addVpc(args: AwsRemoteTerraformHookArgs): void {
  const { state, options } = args;

  if (!options.vpc) {
    return;
  }

  const vpcs = Array.isArray(options.vpc) ? options.vpc : [options.vpc];

  for (const item of vpcs) {
    const { name = 'default', subnetCount = 2 } = item;

    function nameTag(
      ...postfix: string[]
    ): InstanceType<AwsRemoteTerraformHookArgs['state']['Map']> {
      return new state.Map({
        Name: [name, ...postfix].join('-'),
      });
    }

    const vpc = state.add('resource', 'aws_vpc', name, {
      cidr_block: '10.120.0.0/16',
      enable_dns_support: true,
      enable_dns_hostnames: true,
      tags: new state.Map({
        Name: 'backyard--vpc',
      }),
    });

    const az = state.get('data', 'aws_availability_zones', 'available');

    const privateSubnets = state.add('resource', 'aws_subnet', 'private', {
      count: subnetCount,
      cidr_block: new state.Function(
        'cidrsubnet',
        vpc.attr('cidr_block'),
        8,
        new state.Argument('count.index'),
      ),
      availability_zone: az.attr('names[count.index]'),
      vpc_id: vpc.id,
      tags: nameTag('private-${count.index}'),
    });

    const publicSubnets = state.add('resource', 'aws_subnet', 'public', {
      count: subnetCount,
      cidr_block: new state.Function(
        'cidrsubnet',
        vpc.attr('cidr_block'),
        8,
        new state.Argument('2 + count.index'),
      ),
      availability_zone: az.attr('names[count.index]'),
      vpc_id: vpc.id,
      tags: nameTag('public-${count.index}'),
    });

    const ig = state.add('resource', 'aws_internet_gateway', 'ig', {
      vpc_id: vpc.id,
      tags: nameTag('ig'),
    });

    state.add('resource', 'aws_route', 'public', {
      route_table_id: vpc.attr('main_route_table_id'),
      destination_cidr_block: '0.0.0.0/0',
      gateway_id: ig.id,
    });

    const eip = state.add('resource', 'aws_eip', 'eip', {
      count: subnetCount,
      vpc: true,
      depends_on: [ig],
      tags: nameTag('eip-${count.index}'),
    });

    const nat = state.add('resource', 'aws_nat_gateway', 'nat', {
      count: subnetCount,
      subnet_id: new state.Function(
        'element',
        publicSubnets.attr('*.id'),
        new state.Argument('count.index'),
      ),
      allocation_id: new state.Function(
        'element',
        eip.attr('*.id'),
        new state.Argument('count.index'),
      ),
      tags: nameTag('nat-${count.index}'),
    });

    const privateRouteTable = state.add(
      'resource',
      'aws_route_table',
      'private-rt',
      {
        count: subnetCount,
        vpc_id: vpc.id,
        route: {
          cidr_block: '0.0.0.0/0',
          nat_gateway_id: new state.Function(
            'element',
            nat.attr('*.id'),
            new state.Argument('count.index'),
          ),
        },
        tags: nameTag('private-rt-${count.index}'),
      },
    );

    state.add('resource', 'aws_route_table_association', 'route-association', {
      count: subnetCount,
      subnet_id: new state.Function(
        'element',
        privateSubnets.attr('*.id'),
        new state.Argument('count.index'),
      ),
      route_table_id: new state.Function(
        'element',
        privateRouteTable.attr('*.id'),
        new state.Argument('count.index'),
      ),
    });
  }
}
