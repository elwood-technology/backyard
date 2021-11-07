module.exports = {
  buckets: [
    {
      id: 'xx',
      displayName: 'Bucket',
      credential: 't',
      provider: 's3',
      bucketName: process.env.BUCKET_NAME,
    },
  ],
  credentials: [
    {
      name: 't',
      credentials: {
        region: 'us-west-1',
        accessKeyId: process.env.AWS_KEY,
        secretAccessKey: process.env.AWS_SECRET,
      },
    },
  ],
};
