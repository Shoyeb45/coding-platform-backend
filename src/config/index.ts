

export const config = {
    nodeEnv: process.env.NODE_ENV || "development",
    port: process.env.PORT || 4000,
    region: process.env.AWS_REGION || '',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    s3BucketName: process.env.S3_BUCKET_NAME,
    judge0_api_url: process.env.JUDGE0_API_URL,
    judge0_api_key: process.env.JUDGE0_API_KEY,
}

