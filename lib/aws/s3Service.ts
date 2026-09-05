import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import heicConvert from "heic-convert";

export interface OptimizedVariantsMap {
  w400: string;
  w800: string;
  w1200: string;
  w1600: string;
}

export interface S3UploadResult {
  url: string;
  key: string;
  originalKey: string;
  isS3: boolean;
  mimeType: string;
  originalName: string;
  optimized: OptimizedVariantsMap;
  blurDataURL: string;
  width: number;
  height: number;
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

function getCleanBaseName(fileName: string): string {
  const nameWithoutExt = path.basename(fileName, path.extname(fileName));
  const cleanName = nameWithoutExt
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return cleanName || "img";
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
 * Optimizes an input image buffer into 4 responsive WebP derivatives + 20px blur placeholder
 */
export async function optimizeImageBuffer(inputBuffer: Buffer): Promise<{
  variants: {
    w400: Buffer;
    w800: Buffer;
    w1200: Buffer;
    w1600: Buffer;
  };
  blurDataURL: string;
  width: number;
  height: number;
}> {
  // Let sharp decode input (auto-rotates EXIF)
  const baseSharp = sharp(inputBuffer).rotate();
  const meta = await baseSharp.metadata();
  const origWidth = meta.width || 1200;
  const origHeight = meta.height || 1200;

  // Generate responsive derivatives with WebP compression
  const [w400, w800, w1200, w1600, blurBuf] = await Promise.all([
    sharp(inputBuffer)
      .rotate()
      .resize(400, null, { withoutEnlargement: true, fit: "inside" })
      .webp({ quality: 82, effort: 4 })
      .toBuffer(),
    sharp(inputBuffer)
      .rotate()
      .resize(800, null, { withoutEnlargement: true, fit: "inside" })
      .webp({ quality: 84, effort: 4 })
      .toBuffer(),
    sharp(inputBuffer)
      .rotate()
      .resize(1200, null, { withoutEnlargement: true, fit: "inside" })
      .webp({ quality: 85, effort: 4 })
      .toBuffer(),
    sharp(inputBuffer)
      .rotate()
      .resize(1600, null, { withoutEnlargement: true, fit: "inside" })
      .webp({ quality: 85, effort: 4 })
      .toBuffer(),
    sharp(inputBuffer)
      .rotate()
      .resize(20, 20, { fit: "inside" })
      .webp({ quality: 20 })
      .toBuffer(),
  ]);

  const blurDataURL = `data:image/webp;base64,${blurBuf.toString("base64")}`;

  return {
    variants: {
      w400,
      w800,
      w1200,
      w1600,
    },
    blurDataURL,
    width: origWidth,
    height: origHeight,
  };
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
export async function uploadToS3Direct(
  buffer: Buffer,
  s3Key: string,
  mimeType: string,
  bucket: string,
  region: string,
  accessKey: string,
  secretKey: string,
  cacheControl: string = "public, max-age=31536000, immutable"
): Promise<string> {
  const host = `${bucket}.s3.${region}.amazonaws.com`;
  const canonicalUri = "/" + s3Key.split("/").map(encodeURIComponent).join("/");
  const endpoint = `https://${host}${canonicalUri}`;

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.substring(0, 8);

  const payloadHash = crypto.createHash("sha256").update(buffer).digest("hex");

  // Alphabetic order: cache-control, content-type, host, x-amz-content-sha256, x-amz-date
  const canonicalHeaders =
    `cache-control:${cacheControl}\n` +
    `content-type:${mimeType}\n` +
    `host:${host}\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${amzDate}\n`;

  const signedHeaders = "cache-control;content-type;host;x-amz-content-sha256;x-amz-date";

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
      "Cache-Control": cacheControl,
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
 * Uploads an image to AWS S3:
 * 1. Preserves untouched original under products/{productId}/{imageType}/original/{timestamp}-{filename}
 * 2. Generates and uploads 4 WebP derivatives (400w, 800w, 1200w, 1600w) under products/{productId}/{imageType}/optimized/
 * 3. Generates a progressive 20px blur placeholder data URI
 * 4. Returns complete multi-resolution metadata
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

  let workingBuffer = buffer;
  let rawMime = mimeType;
  let targetExt = ext || ".jpg";

  if (isHeic) {
    try {
      workingBuffer = await convertHeicToJpeg(buffer);
      rawMime = "image/jpeg";
      targetExt = ".jpg";
    } catch (err) {
      console.warn("Could not convert HEIC to JPEG, attempting raw Sharp optimization:", err);
    }
  } else if (ext === ".png" || mimeType.toLowerCase() === "image/png") {
    rawMime = "image/png";
    targetExt = ".png";
  } else if (ext === ".webp" || mimeType.toLowerCase() === "image/webp") {
    rawMime = "image/webp";
    targetExt = ".webp";
  } else {
    rawMime = "image/jpeg";
    targetExt = ".jpg";
  }

  const cleanName = sanitizeFileName(originalFileName, targetExt);
  const cleanBaseName = getCleanBaseName(originalFileName);

  // Generate responsive derivatives with Sharp
  const { variants, blurDataURL, width, height } = await optimizeImageBuffer(workingBuffer);

  // Structured S3 Keys
  const originalKey = `products/${productId}/${imageType}/original/${timestamp}-${cleanName}`;
  const key400 = `products/${productId}/${imageType}/optimized/${timestamp}-${cleanBaseName}-400w.webp`;
  const key800 = `products/${productId}/${imageType}/optimized/${timestamp}-${cleanBaseName}-800w.webp`;
  const key1200 = `products/${productId}/${imageType}/optimized/${timestamp}-${cleanBaseName}-1200w.webp`;
  const key1600 = `products/${productId}/${imageType}/optimized/${timestamp}-${cleanBaseName}-1600w.webp`;

  if (isS3Configured()) {
    const region = process.env.AWS_REGION || "ap-southeast-2";
    const bucket = process.env.AWS_S3_BUCKET_NAME || "insha-collection-assets";
    const accessKey = process.env.AWS_ACCESS_KEY_ID!.trim();
    const secretKey = process.env.AWS_SECRET_ACCESS_KEY!.trim();

    try {
      // 1. Upload untouched original to S3
      await uploadToS3Direct(
        buffer,
        originalKey,
        rawMime,
        bucket,
        region,
        accessKey,
        secretKey,
        "public, max-age=31536000, immutable"
      );

      // 2. Upload 4 WebP derivatives in parallel to S3
      await Promise.all([
        uploadToS3Direct(
          variants.w400,
          key400,
          "image/webp",
          bucket,
          region,
          accessKey,
          secretKey,
          "public, max-age=31536000, immutable"
        ),
        uploadToS3Direct(
          variants.w800,
          key800,
          "image/webp",
          bucket,
          region,
          accessKey,
          secretKey,
          "public, max-age=31536000, immutable"
        ),
        uploadToS3Direct(
          variants.w1200,
          key1200,
          "image/webp",
          bucket,
          region,
          accessKey,
          secretKey,
          "public, max-age=31536000, immutable"
        ),
        uploadToS3Direct(
          variants.w1600,
          key1600,
          "image/webp",
          bucket,
          region,
          accessKey,
          secretKey,
          "public, max-age=31536000, immutable"
        ),
      ]);

      const primaryDisplayUrl = `/api/images/s3/${key800}`;

      return {
        url: primaryDisplayUrl,
        key: originalKey,
        originalKey: originalKey,
        isS3: true,
        mimeType: "image/webp",
        originalName: originalFileName,
        optimized: {
          w400: `/api/images/s3/${key400}`,
          w800: `/api/images/s3/${key800}`,
          w1200: `/api/images/s3/${key1200}`,
          w1600: `/api/images/s3/${key1600}`,
        },
        blurDataURL,
        width,
        height,
        message: `Successfully uploaded original and 4 optimized WebP derivatives to AWS S3 (s3://${bucket}/${originalKey})`,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "S3 Upload Error";
      console.error("[AWS S3 Error]:", msg);
      throw new Error(`AWS S3 Upload Failed: ${msg}`);
    }
  } else {
    // Development fallback: saves original & optimized derivatives to public/uploads
    const originalDir = path.join(process.cwd(), "public", "uploads", "products", productId, imageType, "original");
    const optimizedDir = path.join(process.cwd(), "public", "uploads", "products", productId, imageType, "optimized");

    if (!fs.existsSync(originalDir)) fs.mkdirSync(originalDir, { recursive: true });
    if (!fs.existsSync(optimizedDir)) fs.mkdirSync(optimizedDir, { recursive: true });

    const localOrigName = `${timestamp}-${cleanName}`;
    const local400Name = `${timestamp}-${cleanBaseName}-400w.webp`;
    const local800Name = `${timestamp}-${cleanBaseName}-800w.webp`;
    const local1200Name = `${timestamp}-${cleanBaseName}-1200w.webp`;
    const local1600Name = `${timestamp}-${cleanBaseName}-1600w.webp`;

    fs.writeFileSync(path.join(originalDir, localOrigName), buffer);
    fs.writeFileSync(path.join(optimizedDir, local400Name), variants.w400);
    fs.writeFileSync(path.join(optimizedDir, local800Name), variants.w800);
    fs.writeFileSync(path.join(optimizedDir, local1200Name), variants.w1200);
    fs.writeFileSync(path.join(optimizedDir, local1600Name), variants.w1600);

    const publicUrl = `/uploads/products/${productId}/${imageType}/optimized/${local800Name}`;

    return {
      url: publicUrl,
      key: originalKey,
      originalKey: originalKey,
      isS3: false,
      mimeType: "image/webp",
      originalName: originalFileName,
      optimized: {
        w400: `/uploads/products/${productId}/${imageType}/optimized/${local400Name}`,
        w800: `/uploads/products/${productId}/${imageType}/optimized/${local800Name}`,
        w1200: `/uploads/products/${productId}/${imageType}/optimized/${local1200Name}`,
        w1600: `/uploads/products/${productId}/${imageType}/optimized/${local1600Name}`,
      },
      blurDataURL,
      width,
      height,
      message: "Stored locally (AWS access keys pending in .env.local)",
    };
  }
}
