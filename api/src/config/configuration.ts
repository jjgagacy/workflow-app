export default () => ({
  hi: 'hello nest',
  defaultApplicationName: process.env.APPLICATION_NAME || 'monie/workflow',
  systemSupportsEmail: process.env.SYSTEM_SUPPORTS_EMAIL || 'supports@monie.cc',
  storage: {
    // driver: process.env.STORAGE_DRIVER || 'opendal',
    opendal: {
      scheme: process.env.OPENDAL_SCHEME || 'fs',
      fs: {
        root: process.env.OPENDAL_FS_ROOT || 'storage',
      },
      s3: {
        bucket: process.env.OPENDAL_S3_BUCKET,
        region: process.env.OPENDAL_S3_REGION,
        accessKeyId: process.env.OPENDAL_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.OPENDAL_S3_SECRET_ACCESS_KEY,
        endpoint: process.env.OPENDAL_S3_ENDPOINT,
      },
    },
    aws: {
      bucket: process.env.AWS_S3_BUCKET,
      region: process.env.AWS_REGION,
    },
  },
});
