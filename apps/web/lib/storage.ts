import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { fetchWithTimeout } from "@dub/utils";

interface ImageOptions {
  contentType?: string;
  width?: number;
  height?: number;
}

class StorageClient {
  private client: S3Client;
  private bucket: string;

  constructor() {
    this.client = new S3Client();
    this.bucket = process.env.STORAGE_BUCKET_NAME!;
  }

  async upload(key: string, body: Blob | Buffer | string, opts?: ImageOptions) {
    let uploadBody: Buffer;

    if (typeof body === "string") {
      if (this.isBase64(body)) {
        uploadBody = this.base64ToBuffer(body);
      } else if (this.isUrl(body)) {
        uploadBody = await this.urlToBuffer(body, opts);
      } else {
        throw new Error("Invalid input: Not a base64 string or a valid URL");
      }
    } else if (body instanceof Blob) {
      uploadBody = Buffer.from(await body.arrayBuffer());
    } else {
      uploadBody = body;
    }

    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: Buffer.from(uploadBody),
          ContentType: opts?.contentType,
          ContentLength: uploadBody.byteLength,
        }),
      );
      return {
        url: `${process.env.STORAGE_BASE_URL}/${key}`,
      };
    } catch (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async delete(key: string) {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  private base64ToBuffer(base64: string): Buffer {
    const base64Data = base64.replace(/^data:.+;base64,/, "");
    const paddedBase64Data = base64Data.padEnd(
      base64Data.length + ((4 - (base64Data.length % 4)) % 4),
      "=",
    );

    return Buffer.from(paddedBase64Data, "base64");
  }

  private isBase64(str: string): boolean {
    const regex = /^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,([^\s]*)$/;
    return regex.test(str);
  }

  private isUrl(str: string): boolean {
    try {
      new URL(str);
      return true;
    } catch (_) {
      return false;
    }
  }

  private async urlToBuffer(url: string, opts?: ImageOptions): Promise<Buffer> {
    let response: Response;
    if (opts?.height || opts?.width) {
      try {
        const proxyUrl = new URL("https://wsrv.nl");
        proxyUrl.searchParams.set("url", url);
        if (opts.width) proxyUrl.searchParams.set("w", opts.width.toString());
        if (opts.height) proxyUrl.searchParams.set("h", opts.height.toString());
        proxyUrl.searchParams.set("fit", "cover");
        response = await fetchWithTimeout(proxyUrl.toString());
      } catch (error) {
        response = await fetch(url);
      }
    } else {
      response = await fetch(url);
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }
    const blob = await response.blob();
    return Buffer.from(await blob.arrayBuffer());
  }
}

export const storage = new StorageClient();

export const isStored = (url: string) => {
  return url.startsWith(process.env.STORAGE_BASE_URL || "");
};
