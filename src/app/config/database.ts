import dynamoose from 'dynamoose';

if (process.env.STAGE === 'local') {
  dynamoose.aws.sdk.config.update({
    accessKeyId: 'test',
    secretAccessKey: 'test',
    region: 'us-east-1',
  });
  dynamoose.aws.ddb.local('http://127.0.0.1:4566');
}

export default dynamoose;
