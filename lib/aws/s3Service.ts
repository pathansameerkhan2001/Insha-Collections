import fs from "fs";
import path from "path";
import crypto from "crypto";
import heicConvert from "heic-convert";

export interface S3UploadResult {
  url: string;
  key: string;
  isS3: boolean;
  mimeType: string;
  originalName: string;
  message?: string;
}

export function isS3Configured(): boolean {
  const region = process.env.AWS_REGION;
  const keyId = process.env.AWS_ACCESS_KEY_ID;
  const secret = process.env.AWS_SECRET_ACCESS_KEY;
  const bucket = process.env.AWS_S3_BUCKET_NAME;

  return Boolean(
    region &&
    keyId && keyId.trim().length > 0 &&
    secret && secret.trim().length > 0 &&
    bucket && bucket.trim().length > 0
  );
}

export function getS3Status() {
  const configured = isS3Configured();
  return {
    configured,
    bucket: process.env.AWS_S3_BUCKET_NAME || "insha-collection-assets",
    region: process.env.AWS_REGION || "ap-southeast-2",
    statusText: configured
      ? "Connected to AWS S3 (Bucket: insha-collection-assets)"
      : "Pending AWS Access Keys (Configured for insha-collection-assets)",
  };
}

/**
 * Normalizes category to standard S3 folder naming
 */
export function getCategoryS3Folder(category: string): string {
  const cat = (category || "").toLowerCase();
  switch (cat) {
    case "jewellery":
      return "products/jewellery";
    case "korean":
      return "products/korean-items";
    case "dresses":
      return "products/readymade-dresses";
    case "materials":
      return "products/dress-materials";
    case "handlooms":
      return "products/handlooms";
    case "beauty":
      return "products/beauty-salon";
    default:
      return "products/general";
  }
}

/**
 * Clean filename to safe alphanumeric slug preserving extension
 */
function sanitizeFileName(fileName: string, targetExt?: string): string {
  const ext = (targetExt || path.extname(fileName) || ".jpg").toLowerCase();
  const nameWithoutExt = path.basename(fileName, path.extname(fileName));
  const cleanName = nameWithoutExt
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return `${cleanName || "img"}${ext}`;
}

function hmac(key: Buffer | string, data: string): Buffer {
  return crypto.createHmac("sha256", key).update(data, "utf8").digest();
}

/**
 * Converts HEIC or HEIF image buffer to a browser-compatible JPEG Buffer
 */
export async function convertHeicToJpeg(buffer: Buffer): Promise<Buffer> {
  try {
    const outputBuffer = await heicConvert({
      buffer: buffer,
      format: "JPEG",
      quality: 0.92,
    });
    return Buffer.from(outputBuffer);
  } catch (err) {
    console.error("HEIC conversion failed:", err);
    throw new Error(
      `Failed to convert HEIC/HEIF image to JPEG: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

/**
 * Fetches an object securely from AWS S3 using SigV4 GET
 */
export async function getS3Object(s3Key: string): Promise<{
  buffer: Buffer;
  contentType: string;
  etag?: string;
  contentLength?: number;
}> {
  if (!isS3Configured()) {
    throw new Error("AWS S3 is not configured in environment variables.");
  }

  const region = process.env.AWS_REGION || "ap-southeast-2";
  const bucket = process.env.AWS_S3_BUCKET_NAME || "insha-collection-assets";
  const accessKey = process.env.AWS_ACCESS_KEY_ID!.trim();
  const secretKey = process.env.AWS_SECRET_ACCESS_KEY!.trim();

  const host = `${bucket}.s3.${region}.amazonaws.com`;
  const canonicalUri = "/" + s3Key.split("/").map(encodeURIComponent).join("/");
  const endpoint = `https://${host}${canonicalUri}`;

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.substring(0, 8);
  const payloadHash = crypto.createHash("sha256").update("").digest("hex");

  const canonicalHeaders =
    `host:${host}\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${amzDate}\n`;
  const signedHeaders = "host;x-amz-content-sha256;x-amz-date";

  const canonicalRequest = `GET\n${canonicalUri}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
  const canonicalRequestHash = crypto
    .createHash("sha256")
    .update(canonicalRequest, "utf8")
    .digest("hex");

  const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
  const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${canonicalRequestHash}`;

  const kDate = hmac("AWS4" + secretKey, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, "s3");
  const kSigning = hmac(kService, "aws4_request");
  const signature = crypto
    .createHmac("sha256", kSigning)
    .update(stringToSign, "utf8")
    .digest("hex");

  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      "x-amz-date": amzDate,
      "x-amz-content-sha256": payloadHash,
      Authorization: authorization,
    },
  });

  if (!response.ok) {
    throw new Error(`S3 GetObject failed (${response.status} ${response.statusText}): ${s3Key}`);
  }

  const arrayBuf = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuf);
  const contentType = response.headers.get("content-type") || "application/octet-stream";
  const etag = response.headers.get("etag") || undefined;
  const contentLength = Number(response.headers.get("content-length")) || buffer.byteLength;

  return {
    buffer,
    contentType,
    etag,
    contentLength,
  };
}

/**
 * Generates an AWS S3 SigV4 Presigned GET URL
 */
export function generatePresignedGetUrl(
  s3Key: string,
  expiresInSeconds: number = 3600
): string {
  if (!isS3Configured()) {
    return `/api/images/s3/${s3Key}`;
  }

  const region = process.env.AWS_REGION || "ap-southeast-2";
  const bucket = process.env.AWS_S3_BUCKET_NAME || "insha-collection-assets";
  const accessKey = process.env.AWS_ACCESS_KEY_ID!.trim();
  const secretKey = process.env.AWS_SECRET_ACCESS_KEY!.trim();

  const host = `${bucket}.s3.${region}.amazonaws.com`;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.substring(0, 8);
  const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;

  const canonicalUri = "/" + s3Key.split("/").map(encodeURIComponent).join("/");

  const queryParams: Record<string, string> = {
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${accessKey}/${credentialScope}`,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": expiresInSeconds.toString(),
    "X-Amz-SignedHeaders": "host",
  };

  const sortedKeys = Object.keys(queryParams).sort();
  const canonicalQuery = sortedKeys
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(queryParams[k])}`)
    .join("&");

  const canonicalHeaders = `host:${host}\n`;
  const signedHeaders = "host";
  const payloadHash = "UNSIGNED-PAYLOAD";

  const canonicalRequest = `GET\n${canonicalUri}\n${canonicalQuery}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
  const canonicalRequestHash = crypto
    .createHash("sha256")
    .update(canonicalRequest, "utf8")
    .digest("hex");

  const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${canonicalRequestHash}`;

  const kDate = hmac("AWS4" + secretKey, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, "s3");
  const kSigning = hmac(kService, "aws4_request");
  const signature = crypto
    .createHmac("sha256", kSigning)
    .update(stringToSign, "utf8")
    .digest("hex");

  return `https://${host}${canonicalUri}?${canonicalQuery}&X-Amz-Signature=${signature}`;
}

/**
 * Signs and performs AWS S3 PutObject request using standard SigV4
 */
async function uploadToS3Direct(
  buffer: Buffer,
  s3Key: string,
  mimeType: string,
  bucket: string,
  region: string,
  accessKey: string,
  secretKey: string
): Promise<string> {
  const host = `${bucket}.s3.${region}.amazonaws.com`;
  const canonicalUri = "/" + s3Key.split("/").map(encodeURIComponent).join("/");
  const endpoint = `https://${host}${canonicalUri}`;

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.substring(0, 8);

  const payloadHash = crypto.createHash("sha256").update(buffer).digest("hex");

  const canonicalHeaders =
    `content-type:${mimeType}\n` +
    `host:${host}\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${amzDate}\n`;

  const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";

  const canonicalRequest =
    `PUT\n` +
    `${canonicalUri}\n` +
    `\n` +
    `${canonicalHeaders}\n` +
    `${signedHeaders}\n` +
    `${payloadHash}`;

  const canonicalRequestHash = crypto
    .createHash("sha256")
    .update(canonicalRequest, "utf8")
    .digest("hex");

  const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
  const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${canonicalRequestHash}`;

  const kDate = hmac("AWS4" + secretKey, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, "s3");
  const kSigning = hmac(kService, "aws4_request");
  const signature = crypto
    .createHmac("sha256", kSigning)
    .update(stringToSign, "utf8")
    .digest("hex");

  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const response = await fetch(endpoint, {
    method: "PUT",
    headers: {
      "Content-Type": mimeType,
      "x-amz-date": amzDate,
      "x-amz-content-sha256": payloadHash,
      Authorization: authorization,
    },
    body: buffer as unknown as BodyInit,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`S3 PutObject Failed (${response.status} ${response.statusText}): ${errorText}`);
  }

  return endpoint;
}

/**
 * Uploads an image to AWS S3 under products/{productId}/{imageType}/ structure,
 * converts HEIC/HEIF to browser-displayable JPEG, and returns a secure display URL.
 */
export async function uploadProductImage(
  buffer: Buffer,
  originalFileName: string,
  mimeType: string,
  category: string,
  productId: string = "new",
  imageType: "showcase" | "real" | "general" = "real"
): Promise<S3UploadResult> {
  const timestamp = Date.now();
  const ext = (path.extname(originalFileName) || "").toLowerCase();
  const isHeic =
    ext === ".heic" ||
    ext === ".heif" ||
    mimeType.toLowerCase() === "image/heic" ||
    mimeType.toLowerCase() === "image/heif";

  let uploadBuffer = buffer;
  let uploadMime = mimeType;
  let targetExt = ext || ".jpg";

  if (isHeic) {
    // Convert HEIC/HEIF to JPEG derivative for universal browser display
    try {
      uploadBuffer = await convertHeicToJpeg(buffer);
      uploadMime = "image/jpeg";
      targetExt = ".jpg";
    } catch (err) {
      console.warn("Could not convert HEIC to JPEG, uploading raw buffer:", err);
    }
  } else if (ext === ".png" || mimeType.toLowerCase() === "image/png") {
    uploadMime = "image/png";
    targetExt = ".png";
  } else if (ext === ".webp" || mimeType.toLowerCase() === "image/webp") {
    uploadMime = "image/webp";
    targetExt = ".webp";
  } else {
    uploadMime = "image/jpeg";
    targetExt = ".jpg";
  }

  const cleanName = sanitizeFileName(originalFileName, targetExt);
  // Structured S3 Key: products/{productId}/{showcase|real}/{timestamp}-{filename}
  const s3Key = `products/${productId}/${imageType}/${timestamp}-${cleanName}`;

  if (isS3Configured()) {
    const region = process.env.AWS_REGION || "ap-southeast-2";
    const bucket = process.env.AWS_S3_BUCKET_NAME || "insha-collection-assets";
    const accessKey = process.env.AWS_ACCESS_KEY_ID!.trim();
    const secretKey = process.env.AWS_SECRET_ACCESS_KEY!.trim();

    try {
      await uploadToS3Direct(
        uploadBuffer,
        s3Key,
        uploadMime,
        bucket,
        region,
        accessKey,
        secretKey
      );

      // Secure internal delivery URL (authenticated via server API)
      const secureDisplayUrl = `/api/images/s3/${s3Key}`;

      return {
        url: secureDisplayUrl,
        key: s3Key,
        isS3: true,
        mimeType: uploadMime,
        originalName: originalFileName,
        message: `Successfully uploaded to AWS S3 (s3://${bucket}/${s3Key})`,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "S3 Upload Error";
      console.error("[AWS S3 Error]:", msg);
      throw new Error(`AWS S3 Upload Failed: ${msg}`);
    }
  } else {
    // Development fallback: saves to public/uploads/products so the image is immediately visible locally
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "products", productId, imageType);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const localFileName = `${timestamp}-${cleanName}`;
    const localFilePath = path.join(uploadsDir, localFileName);
    fs.writeFileSync(localFilePath, uploadBuffer);

    const publicUrl = `/uploads/products/${productId}/${imageType}/${localFileName}`;

    return {
      url: publicUrl,
      key: s3Key,
      isS3: false,
      mimeType: uploadMime,
      originalName: originalFileName,
      message: "Stored locally (AWS access keys pending in .env.local)",
    };
  }
}
