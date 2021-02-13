/* eslint-disable no-template-curly-in-string */
import type { AWS } from '@serverless/typescript';

const serverlessConfiguration: AWS = {
  service: 'motor-control-websocket-service',
  frameworkVersion: '2',
  package: {
    excludeDevDependencies: true,
    individually: true,
  },
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true,
    },
  },
  plugins: [
    'serverless-webpack',
    'serverless-offline',
    'serverless-dotenv-plugin',
  ],
  provider: {
    name: 'aws',
    apiName: 'motor-control-websocket',
    runtime: 'nodejs12.x',
    stage: "${env:STAGE, 'dev'}",
    memorySize: 128,
    logRetentionInDays: 3,
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
    },
  },
  functions: {
    connectionHandler: {
      handler: 'src/server.connectionManager',
      role: 'LambdaRole',
      events: [
        {
          websocket: {
            route: '$connect',
          },
        },
        {
          websocket: {
            route: '$disconnect',
          },
        },
      ],
    },
    messageHandler: {
      handler: 'src/server.messageHandler',
      role: 'LambdaRole',
      events: [
        {
          websocket: {
            route: '$default',
          },
        },
      ],
    },
    sendmessageHandler: {
      handler: 'src/server.togglePinStatus',
      role: 'LambdaRole',
      events: [
        {
          websocket: {
            route: 'togglePinStatus',
          },
        },
      ],
    },
  },
  resources: {
    Resources: {
      LambdaRole: {
        Type: 'AWS::IAM::Role',
        Properties: {
          RoleName: 'MotorControlServiceWebSocket',
          AssumeRolePolicyDocument: {
            Version: '2012-10-17',
            Statement: {
              Effect: 'Allow',
              Principal: {
                Service: ['lambda.amazonaws.com'],
              },
              Action: 'sts:AssumeRole',
            },
          },
          Policies: [
            {
              PolicyName: 'motor-control-werbsocket-service',
              PolicyDocument: {
                Version: '2012-10-17',
                Statement: [
                  {
                    Effect: 'Allow',
                    Action: [
                      'logs:createLogGroup',
                      'logs:createLogStream',
                      'logs:putLogEvents',
                    ],
                    Resource: 'arn:aws:logs:${self:provider.region}:*:*:*:*',
                  },
                  {
                    Effect: 'Allow',
                    Action: [
                      'dynamodb:GetItem',
                      'dynamodb:PutItem',
                      'dynamodb:Scan',
                      'dynamodb:UpdateItem',
                      'dynamodb:CreateTable',
                      'dynamodb:DescribeTable',
                      'dynamodb:DeleteItem',
                      'dynamodb:Query',
                    ],
                    Resource:
                      'arn:aws:dynamodb:${self:provider.region}:*:table/Boards',
                  },
                  {
                    Effect: 'Allow',
                    Action: [
                      'xray:PutTraceSegments',
                      'xray:PutTelemetryRecords',
                    ],
                    Resource: '*',
                  },
                ],
              },
            },
          ],
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
