import { S3Client, PutObjectCommand, PutObjectCommandInput } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

export class S3Uploader {
  private s3: S3Client;

  constructor(
    private bucketName: string,
    private region: string,
    private accessKeyId: string,
    private secretAccessKey: string
  ) {
    this.s3 = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey,
      },
    });
  }

  async uploadFile(
    fileKey: string,
    fileContent: Buffer | Readable,
    contentType: string
  ): Promise<string> {
    const params: PutObjectCommandInput = {
      Bucket: this.bucketName,
      Key: fileKey,
      Body: fileContent,
      ContentType: contentType,
    };

    try {
      console.log(`Uploading file to S3: s3://${this.bucketName}/${fileKey}`);

      const command = new PutObjectCommand(params);
      await this.s3.send(command);

      const fileUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${fileKey}`;
      console.log(`File uploaded successfully: ${fileUrl}`);

      return fileUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`S3 Upload Error for ${fileKey}:`, errorMessage);
      throw new Error(`Failed to upload ${fileKey}: ${errorMessage}`);
    }
  }
}
