import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";

const envFile = fs.readFileSync(".env.local", "utf8");
const envVars = {};
for (const line of envFile.split("\n")) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
    const [key, ...rest] = trimmed.split("=");
    envVars[key.trim()] = rest.join("=").trim();
  }
}

const region = envVars.AWS_REGION || "ap-southeast-2";
const bucket = envVars.AWS_S3_BUCKET_NAME || "insha-collection-assets";
const accessKey = envVars.AWS_ACCESS_KEY_ID;
const secretKey = envVars.AWS_SECRET_ACCESS_KEY;

function hmac(key, data) {
  return crypto.createHmac("sha256", key).update(data, "utf8").digest();
}

async function getS3Object(s3Key) {
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
  return Buffer.from(arrayBuf);
}

async function uploadToS3(buffer, s3Key, contentType, cacheControl = "public, max-age=31536000, immutable") {
  const host = `${bucket}.s3.${region}.amazonaws.com`;
  const canonicalUri = "/" + s3Key.split("/").map(encodeURIComponent).join("/");
  const endpoint = `https://${host}${canonicalUri}`;

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.substring(0, 8);
  const payloadHash = crypto.createHash("sha256").update(buffer).digest("hex");

  const canonicalHeaders =
    `cache-control:${cacheControl}\n` +
    `content-length:${buffer.byteLength}\n` +
    `content-type:${contentType}\n` +
    `host:${host}\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${amzDate}\n`;
  const signedHeaders = "cache-control;content-length;content-type;host;x-amz-content-sha256;x-amz-date";

  const canonicalRequest = `PUT\n${canonicalUri}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
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
      "Content-Type": contentType,
      "Content-Length": String(buffer.byteLength),
      "Cache-Control": cacheControl,
      "x-amz-date": amzDate,
      "x-amz-content-sha256": payloadHash,
      Authorization: authorization,
    },
    body: buffer,
  });

  if (!response.ok) {
    throw new Error(`S3 PutObject failed (${response.status} ${response.statusText}): ${s3Key}`);
  }
}

async function optimizeAndUpload(s3Key) {
  const cleanKey = s3Key.replace(/^\/api\/images\/s3\//, "").split("?")[0];
  if (!cleanKey.startsWith("products/")) return null;
  if (cleanKey.includes("-400w.webp") || cleanKey.includes("-800w.webp")) return null;

  console.log(`\nProcessing original S3 image: ${cleanKey}`);
  const t0 = Date.now();
  const origBuffer = await getS3Object(cleanKey);
  const origSize = origBuffer.byteLength;
  console.log(`  -> Downloaded original: ${(origSize / 1024).toFixed(1)} KB in ${Date.now() - t0}ms`);

  const baseFolder = path.dirname(cleanKey);
  const baseName = path.basename(cleanKey, path.extname(cleanKey));

  // Determine derivative keys
  const key400 = `${baseFolder}/${baseName}-400w.webp`;
  const key800 = `${baseFolder}/${baseName}-800w.webp`;
  const key1200 = `${baseFolder}/${baseName}-1200w.webp`;

  const [w400, w800, w1200] = await Promise.all([
    sharp(origBuffer).rotate().resize(400, null, { withoutEnlargement: true, fit: "inside" }).webp({ quality: 82, effort: 4 }).toBuffer(),
    sharp(origBuffer).rotate().resize(800, null, { withoutEnlargement: true, fit: "inside" }).webp({ quality: 84, effort: 4 }).toBuffer(),
    sharp(origBuffer).rotate().resize(1200, null, { withoutEnlargement: true, fit: "inside" }).webp({ quality: 85, effort: 4 }).toBuffer(),
  ]);

  console.log(`  -> Generated WebP variants: 400w=${(w400.byteLength / 1024).toFixed(1)}KB, 800w=${(w800.byteLength / 1024).toFixed(1)}KB, 1200w=${(w1200.byteLength / 1024).toFixed(1)}KB`);

  await Promise.all([
    uploadToS3(w400, key400, "image/webp"),
    uploadToS3(w800, key800, "image/webp"),
    uploadToS3(w1200, key1200, "image/webp"),
  ]);

  console.log(`  -> Uploaded 3 optimized WebP derivatives to S3 successfully!`);
  return {
    originalSize: origSize,
    w400Size: w400.byteLength,
    w800Size: w800.byteLength,
    w1200Size: w1200.byteLength,
    key400,
    key800,
  };
}

async function main() {
  const products = JSON.parse(fs.readFileSync(".data/products.json", "utf8"));
  console.log(`Scanning ${products.length} products for S3 images to pre-optimize...`);

  const results = [];
  for (const p of products) {
    const keys = [];
    if (p.showcaseImage) {
      const k = typeof p.showcaseImage === "string" ? p.showcaseImage : p.showcaseImage.url;
      if (k) keys.push(k);
    }
    if (p.realImages) {
      for (const r of p.realImages) {
        const k = typeof r === "string" ? r : r.url;
        if (k) keys.push(k);
      }
    }

    for (const key of keys) {
      try {
        const res = await optimizeAndUpload(key);
        if (res) results.push({ product: p.name, ...res });
      } catch (err) {
        console.error(`Error optimizing ${key}:`, err.message);
      }
    }
  }

  console.log(`\n=== OPTIMIZATION SUMMARY ===`);
  console.log(`Total images pre-optimized: ${results.length}`);
  for (const r of results) {
    const reduction = ((1 - r.w400Size / r.originalSize) * 100).toFixed(1);
    console.log(`- ${r.product}: ${(r.originalSize / 1024).toFixed(1)} KB -> ${(r.w400Size / 1024).toFixed(1)} KB (400w) [${reduction}% reduction]`);
  }
}

main().catch(console.error);
