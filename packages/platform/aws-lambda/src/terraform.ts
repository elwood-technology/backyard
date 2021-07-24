import type { AwsEcsTerraformHookArgs } from '@backyard/platform-aws-ecs';

import { createFunctionName } from './config';

export async function terraformAwsEcs(
  args: AwsEcsTerraformHookArgs,
): Promise<void> {
  const { tf, state, service, Heredoc, Map } = args;
  const functionName = createFunctionName(service.config);

  const role = tf.resource('aws_iam_role', `${functionName}-lambda_iam_role`, {
    name: `${functionName}-lambda-role`,
    assume_role_policy: new Heredoc(`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Principal": {
        "Service": [
          "lambda.amazonaws.com"
        ]
      },
      "Action": "sts:AssumeRole"
    }
  ]
}`),
  });

  const policy = tf.resource(
    'aws_iam_policy',
    `${functionName}-lambda_logging_iam`,
    {
      name: `${functionName}-lambda-logging`,
      path: '/',
      description: functionName,
      policy: new Heredoc(`{
  "Version": "2012-10-17",
  "Statement": [
    {
            "Effect": "Allow",
            "Action": [
              "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
                "lambda:InvokeFunction",
                "secretsmanager:*",
                "kms:DescribeKey",
                "kms:ListAliases",
                "kms:ListKeys",
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents",
                "ec2:CreateNetworkInterface",
                "ec2:DescribeNetworkInterfaces",
                "ec2:DeleteNetworkInterface",
                "s3:*"
            ],
            "Resource": "*"
        }
  ]
}`),
    },
  );

  const basic = tf.data('aws_iam_policy', `${functionName}-lambda_vpc_basic`, {
    arn: 'arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole',
  });

  tf.resource(
    'aws_iam_role_policy_attachment',
    `${functionName}-lambda_logs_policy`,
    {
      role: role.attr('name'),
      policy_arn: policy.attr('arn'),
    },
  );

  tf.resource('aws_iam_role_policy_attachment', `${functionName}-lambda_exec`, {
    role: role.attr('name'),
    policy_arn: basic.attr('arn'),
  });

  const dummy = tf.data('archive_file', `${functionName}-dummy-zip`, {
    type: 'zip',
    output_path: '/tmp/dummy_payload.zip',
    source: {
      filename: 'index.js',
      content: new Heredoc(`
    module.exports.handler = async function() {
return {
    "statusCode": 502,
    "statusDescription": "502 OK",
    "isBase64Encoded": false,
    "headers": {
        "Content-Type": "text/html"
    },
    "body": "<h1>Down for maintenance</h1>"
}
  }
`),
    },
  });

  tf.resource('aws_lambda_function', `${functionName}-func`, {
    function_name: functionName,
    filename: dummy.attr('output_path'),
    handler: 'index.handler',
    runtime: 'nodejs12.x',
    publish: true,
    role: role.attr('arn'),
    timeout: 15,
    memory_size: 128,
    vpc_config: {
      subnet_ids: state.privateSubnets.attr('*.id'),
      security_group_ids: [state.albSecurityGroup.attr('id')],
    },
    environment: {
      variables: new Map({
        NODE_ENV: 'production',
      }),
    },
  });
}
