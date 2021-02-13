import dynamoose from 'dynamoose';

if (!dynamoose.aws.sdk.config.region) {
  dynamoose.aws.sdk.config.update({
    region: 'us-east-1',
  });
}

if (process.env.STAGE === 'local') {
  dynamoose.aws.sdk.config.update({
    accessKeyId: process.env.AWS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ID,
  });
}

export default dynamoose;
