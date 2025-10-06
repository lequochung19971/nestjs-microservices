import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as Minio from 'minio';
import { AppConfigService } from 'src/app-config';

export interface StorageUploadOptions {
  filename: string;
  buffer: Buffer;
  mimetype: string;
  path?: string;
}

export interface StorageDeleteOptions {
  filename: string;
  path?: string;
}

export interface StorageGetOptions {
  filename: string;
  path?: string;
}

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private minioClient: Minio.Client;
  private bucket: string;

  constructor(private readonly configService: AppConfigService) {
    this.bucket = this.configService.minio.bucketName;

    this.minioClient = new Minio.Client({
      endPoint: this.configService.minio.endpoint,
      port: this.configService.minio.port,
      useSSL: this.configService.minio.useSSL,
      accessKey: this.configService.minio.accessKey,
      secretKey: this.configService.minio.secretKey,
    });
  }

  async onModuleInit() {
    try {
      // Check if bucket exists, if not, create it
      const bucketExists = await this.minioClient.bucketExists(this.bucket);

      if (!bucketExists) {
        this.logger.log(`Bucket ${this.bucket} does not exist. Creating...`);
        await this.minioClient.makeBucket(this.bucket);

        // Set bucket policy to public read access
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: {
                AWS: ['*'],
              },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucket}/*`],
            },
          ],
        };

        await this.minioClient.setBucketPolicy(
          this.bucket,
          JSON.stringify(policy),
        );
        this.logger.log(
          `Bucket ${this.bucket} created and policy set to public read access`,
        );
      } else {
        this.logger.log(`Bucket ${this.bucket} already exists`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to initialize MinIO storage: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Upload a file to MinIO storage
   */
  async upload(options: StorageUploadOptions): Promise<string> {
    const { filename, buffer, mimetype, path = '' } = options;
    const objectName = path ? `${path}/${filename}` : filename;

    try {
      await this.minioClient.putObject(
        this.bucket,
        objectName,
        buffer,
        buffer.length,
        { 'Content-Type': mimetype },
      );

      // Generate URL for the uploaded file
      const url = await this.getUrl({ filename, path });
      return url;
    } catch (error) {
      this.logger.error(
        `Failed to upload file ${filename}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Delete a file from MinIO storage
   */
  async delete(options: StorageDeleteOptions): Promise<void> {
    const { filename, path = '' } = options;
    const objectName = path ? `${path}/${filename}` : filename;

    try {
      await this.minioClient.removeObject(this.bucket, objectName);
      this.logger.log(`File ${objectName} deleted successfully`);
    } catch (error) {
      this.logger.error(
        `Failed to delete file ${objectName}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get a file from MinIO storage
   */
  async getBuffer(options: StorageGetOptions): Promise<Buffer> {
    const { filename, path = '' } = options;
    const objectName = path ? `${path}/${filename}` : filename;

    try {
      const dataStream = await this.minioClient.getObject(
        this.bucket,
        objectName,
      );

      return new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];

        dataStream.on('data', (chunk) => chunks.push(chunk));
        dataStream.on('end', () => resolve(Buffer.concat(chunks)));
        dataStream.on('error', (err) => reject(err));
      });
    } catch (error) {
      this.logger.error(
        `Failed to get file ${objectName}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get URL for a file in MinIO storage
   */
  async getUrl(options: StorageGetOptions): Promise<string> {
    const { filename, path = '' } = options;
    const objectName = path ? `${path}/${filename}` : filename;

    try {
      const expiresIn = 24 * 60 * 60 * 7; // URL expires in 7 days
      const presignedUrl = await this.minioClient.presignedGetObject(
        this.bucket,
        objectName,
        expiresIn,
      );

      // If using SSL and the URL contains http://, replace with https://
      if (
        this.configService.minio.useSSL &&
        presignedUrl.startsWith('http://')
      ) {
        return presignedUrl.replace('http://', 'https://');
      }

      return presignedUrl;
    } catch (error) {
      this.logger.error(
        `Failed to generate URL for ${objectName}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Check if a file exists in MinIO storage
   */
  async exists(options: StorageGetOptions): Promise<boolean> {
    const { filename, path = '' } = options;
    const objectName = path ? `${path}/${filename}` : filename;

    try {
      await this.minioClient.statObject(this.bucket, objectName);
      return true;
    } catch (error) {
      if (error.code === 'NotFound') {
        return false;
      }
      this.logger.error(
        `Error checking if file ${objectName} exists: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
