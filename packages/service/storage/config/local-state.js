module.exports = {
  buckets: [
    {
      id: 'xx',
      displayName: 'Bucket',
      credential: 't',
      provider: 's3',
      bucketName: process.env.BUCKET_NAME,
      region: 'us-east-1',
    },
  ],
  credentials: [
    {
      name: 't',
      credentials: {
        accessKeyId: process.env.AWS_KEY,
        secretAccessKey: process.env.AWS_SECRET,
      },
    },
  ],
};
