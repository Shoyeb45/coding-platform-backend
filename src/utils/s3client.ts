import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { config } from "../config";
import { logger } from "./logger";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Readable } from "stream";

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
        if (!key) {
            throw new Error("No key provided for deletion.");
        }
        logger.info(`Deleting object with key: ${key}`);

        try {
            const command = new DeleteObjectCommand({
                Bucket: config.s3BucketName,
                Key: key
            });
            await this.s3client.send(command);
            logger.info(`Successfully deleted object: ${key}`);
        } catch (error) {
            logger.error(`Failed to delete object ${key}: ${error}`);
            throw error;
        }
    }
    async listObjects(prefix?: string): Promise<string[]> {
        logger.info(`Listing objects with prefix: ${prefix || "ALL"}`);
        let continuationToken: string | undefined = undefined;
        const allKeys: string[] = [];

        do {
            const command: ListObjectsV2Command = new ListObjectsV2Command({
                Bucket: config.s3BucketName,
                Prefix: prefix,
                ContinuationToken: continuationToken,
            });

            const response = await this.s3client.send(command);

            if (response.Contents) {
                for (const obj of response.Contents) {
                    if (obj.Key) {
                        allKeys.push(obj.Key);
                    }
                }
            }

            continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
        } while (continuationToken);

        logger.info(`Found ${allKeys.length} objects in S3.`);
        return allKeys;
    }

    async getPreviewPresignedUrl(key: string) {
        const command = new GetObjectCommand({
            Key: key,
            Bucket: config.s3BucketName
        });
        return await getSignedUrl(this.s3client, command, { expiresIn: 60 * 20 });
    }

    
    async getFileContent(key: string): Promise<string> {
        const command = new GetObjectCommand({ Bucket: config.s3BucketName, Key: key });
        const response = await this.s3client.send(command);

        if (!response.Body) {
            throw new Error("No body returned from S3");
        }
        
        // Cast explicitly to Readable (safe in Node)
        return await this.streamToString(response.Body as Readable);
    }
    
    private streamToString(stream: Readable): Promise<string> {
        return new Promise((resolve, reject) => {
            const chunks: Buffer[] = [];
            stream.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
            stream.on("error", reject);
            stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
        });
    }
}