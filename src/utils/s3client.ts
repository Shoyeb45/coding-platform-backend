import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { config } from "../config";
import { logger } from "./logger";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export class S3Service {
    private s3client: S3Client;
    private static instance: S3Service;

    private constructor() {
        this.s3client = new S3Client({
            region: config.region,
            credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey,
            },
            // Additional configuration for scalability
            maxAttempts: 3, // Number of times to retry a failed request
        })
        logger.info("S3 client initialised successfully.")
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new S3Service();
        }
        return this.instance;
    }

    async generatePresignedUrl(key: string, contentType: string): Promise<string> {
        if (!key) {
            throw new Error("No key is found to generate presigned url.")
        }
        logger.info("Generating presigned url for requested key: " + key);
        const command = new PutObjectCommand({
            Bucket: config.s3BucketName,
            Key: key,
            ContentType: contentType
        })

        const signedUrl = await getSignedUrl(this.s3client, command, { expiresIn: 300 });
        return signedUrl;
    }

    async deleteObject(key: string) {
        logger.info(`Deleting object with key: ${key}`)
        const command = new DeleteObjectCommand({
            Bucket: config.s3BucketName,
            Key: key
        });
        const obj = await this.s3client.send(command);
    }
}