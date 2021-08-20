import type { AwsRemoteTerraformHookArgs } from '@backyard/platform-aws';
import { JsonObject, ServiceHookProviderArgs } from '@backyard/types';

export async function awsEcsServiceLoadBalancer(
  args: ServiceHookProviderArgs & AwsRemoteTerraformHookArgs,
): Promise<JsonObject> {
  const { state, service } = args;
  const vpc = args.vpc();
  const alb = state.get('resource', 'aws_alb_listener', 'alb-listen');

  const target = state.add(
    'resource',
    'aws_alb_target_group',
    `alb-${service.name}-target`,
    {
      name: 'BackyardWebTarget',
      port: service?.container?.externalPort,
      protocol: 'HTTP',
      vpc_id: vpc?.id,
      target_type: 'ip',
    },
  );
  state.add('resource', 'aws_lb_listener_rule', `alb-${service.name}-target`, {
    listener_arn: alb.attr('arn'),
    priority: 2,

    action: {
      type: 'forward',
      target_group_arn: target.attr('arn'),
    },

    condition: {
      path_pattern: {
        values: ['*'],
      },
    },
  });

  return {
    target_group_arn: target.attr('arn'),
    container_name: service.name,
    container_port: service?.container?.port,
  };
}

// export async function awsAlb(
//   args: ServiceHookProviderArgs & AwsRemoteTerraformHookArgs,
// ): Promise<void> {
//   const { state, service, context } = args;
//   const { region, profile } = (context.platforms.remote?.getOptions() ??
//     {}) as AwsRemoteOptions;

//   const ecr = state.add(
//     'resource',
//     'aws_ecr_repository',
//     `ecs-${service.name}-ecr`,
//     {
//       name: `backyard_${service.name}`,
//       image_tag_mutability: 'MUTABLE',
//     },
//   );

//   const img = state.add('module', `${service.name}_ecr_image`, {
//     source: 'github.com/elwood-technology/terraform-aws-ecr-image',
//     dockerfile_dir: join(context.dir.stage, service.name),
//     ecr_repository_url: ecr.attr('repository_url'),
//     aws_profile: profile,
//     aws_region: region,
//   });

//   // image = img.attr('ecr_image_url').toString();

// state.add('resource', "aws_lambda_function", "test_lambda", {
//   filename      : "lambda_function_payload.zip"
//   function_name : "lambda_function_name"
//   role          ; aws_iam_role.iam_for_lambda.arn
//   handler       ; "index.test"

//   # The filebase64sha256() function is available in Terraform 0.11.12 and later
//   # For Terraform 0.11.11 and earlier, use the base64sha256() function and the file() function:
//   # source_code_hash = "${base64sha256(file("lambda_function_payload.zip"))}"
//   source_code_hash = filebase64sha256("lambda_function_payload.zip")

//   runtime = "nodejs12.x"

//   environment {
//     variables = {
//       foo = "bar"
//     }
//   }
// }
// }

// export async function awsEcsContainerTaskDef(
//   _args: ServiceHookProviderArgs & AwsRemoteTerraformHookArgs,
// ): Promise<JsonObject | undefined> {
//   return undefined;

// const { parent, service, state } = args;
// const vpc = args.vpc();
// const listen = state.get('resource', 'aws_alb_listener', 'alb-listen');

// const target = state.add(
//   'resource',
//   'aws_alb_target_group',
//   'alb-web-target',
//   {
//     name: 'BackyardWebTarget',
//     port: service.container?.port ?? 3000,
//     protocol: 'HTTP',
//     vpc_id: vpc?.id,
//     target_type: 'ip',
//   },
// );

// state.add('resource', 'aws_lb_listener_rule', 'alb-web-listen', {
//   listener_arn: listen.attr('arn'),
//   priority: 90,

//   action: {
//     type: 'forward',
//     target_group_arn: target.attr('arn'),
//   },

//   condition: {
//     path_pattern: {
//       values: ['/*'],
//     },
//   },
// });

// return parent;
// }
