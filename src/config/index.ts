import dotenv from 'dotenv';

dotenv.config();

export const config = {
    // backend app secret
    nodeEnv: process.env.NODE_ENV || "development",
    port: process.env.PORT || 4000,
    region: process.env.AWS_REGION || '',
    
    // aws secret
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    s3BucketName: process.env.S3_BUCKET_NAME,

    // frontend url
    frontend_url : process.env.FRONTEND_URL || "http://localhost:3000",
    // Judge0 secret
    judge0ApiUrl: process.env.JUDGE0_API_URL,
    judge0ApiKey: process.env.JUDGE0_API_KEY,

    // redis
    redisHost: process.env.REDIS_HOST || 'localhost',
    redisPort: parseInt(process.env.REDIS_PORT || '6379'),
    redisPassword: process.env.REDIS_PASSWORD,
    redisTls: process.env.REDIS_TLS === 'true' || false,
    // jwt secret
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "My Jwt Secret",
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "My Jwt Secret"
}

