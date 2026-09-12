import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import crypto from "crypto";
import { getS3Object, convertHeicToJpeg, uploadToS3Direct, isS3Configured } from "@/lib/aws/s3Service";

interface RouteParams {
  params: Promise<{
    key: string[];
  }>;
}

interface CachedImageEntry {
  buffer: Buffer;
  contentType: string;
  etag: string;
  cachedAt: number;
}

// High-speed In-Memory LRU Cache for sub-millisecond repeated responses (< 1ms)
const MEMORY_CACHE = new Map<string, CachedImageEntry>();
const MAX_MEMORY_ITEMS = 500;

function setMemoryCache(key: string, entry: CachedImageEntry) {
  if (MEMORY_CACHE.size >= MAX_MEMORY_ITEMS) {
    const oldestKey = MEMORY_CACHE.keys().next().value;
    if (oldestKey) MEMORY_CACHE.delete(oldestKey);
  }
  MEMORY_CACHE.set(key, entry);
}

// Deduplicate in-flight promises so multiple simultaneous requests for the same image don't do duplicate work
const IN_FLIGHT_PROMISES = new Map<string, Promise<{ buffer: Buffer; contentType: string; etag: string }>>();

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    if (!resolvedParams?.key || resolvedParams.key.length === 0) {
      return new NextResponse("Invalid S3 image key", { status: 400 });
    }

    // Force POSIX path formatting (forward slashes only)
    const rawKey = resolvedParams.key.map(decodeURIComponent).join("/");
    const s3Key = rawKey.split("?")[0].split("#")[0].replace(/\\/g, "/").replace(/^\/+/, "");
    const searchParams = req.nextUrl.searchParams;

    let requestedWidth = searchParams.get("w") ? parseInt(searchParams.get("w")!, 10) : null;
    if (!requestedWidth && rawKey.includes("w=")) {
      const match = rawKey.match(/[?&]w=(\d+)/);
      if (match && match[1]) {
        requestedWidth = parseInt(match[1], 10);
      }
    }

    let requestedQuality = searchParams.get("q") ? parseInt(searchParams.get("q")!, 10) : null;
    if (!requestedQuality && rawKey.includes("q=")) {
      const match = rawKey.match(/[?&]q=(\d+)/);
      if (match && match[1]) {
        requestedQuality = parseInt(match[1], 10);
      }
    }

    const memoryCacheKey = `${s3Key}:w=${requestedWidth || "orig"}:q=${requestedQuality || "def"}`;

    // 1. In-Memory Cache Check (< 1ms response)
    const ifNoneMatch = req.headers.get("if-none-match");
    const cachedEntry = MEMORY_CACHE.get(memoryCacheKey);
    if (cachedEntry) {
      if (ifNoneMatch && ifNoneMatch === cachedEntry.etag) {
        return new NextResponse(null, { status: 304 });
      }

      return new NextResponse(new Uint8Array(cachedEntry.buffer), {
        status: 200,
        headers: {
          "Content-Type": cachedEntry.contentType,
          "Content-Length": String(cachedEntry.buffer.byteLength),
          "Cache-Control": "public, max-age=31536000, immutable",
          "ETag": cachedEntry.etag,
          "Vary": "Accept",
          "X-Image-Cache": "HIT-MEMORY",
        },
      });
    }

    // 2. Direct S3 WebP Request (if already exact derivative or no resize requested)
    const isExactDerivative = requestedWidth ? s3Key.includes(`-${requestedWidth}w.webp`) : true;
    if (s3Key.toLowerCase().endsWith(".webp") && isExactDerivative) {
      const s3Data = await getS3Object(s3Key);
      const generatedEtag = s3Data.etag || `"${crypto.createHash("md5").update(s3Data.buffer).digest("hex")}"`;

      setMemoryCache(memoryCacheKey, {
        buffer: s3Data.buffer,
        contentType: "image/webp",
        etag: generatedEtag,
        cachedAt: Date.now(),
      });

      if (ifNoneMatch && ifNoneMatch === generatedEtag) {
        return new NextResponse(null, { status: 304 });
      }

      return new NextResponse(new Uint8Array(s3Data.buffer), {
        status: 200,
        headers: {
          "Content-Type": "image/webp",
          "Content-Length": String(s3Data.buffer.byteLength),
          "Cache-Control": "public, max-age=31536000, immutable",
          "ETag": generatedEtag,
          "Vary": "Accept",
          "X-Image-Cache": "HIT-S3-DIRECT",
        },
      });
    }

    // 3. Pre-Optimized S3 Derivative Check (using clean base names)
    if (requestedWidth && (requestedWidth === 400 || requestedWidth === 800 || requestedWidth === 1200 || requestedWidth === 1600)) {
      const parts = s3Key.split("/");
      const fileName = parts.pop() || "";
      const baseDir = parts.join("/");
      const dotIdx = fileName.lastIndexOf(".");
      const rawBaseName = dotIdx !== -1 ? fileName.slice(0, dotIdx) : fileName;
      // Strip any existing derivative suffix like -400w, -800w, -1200w, -1600w to avoid -800w-800w.webp
      const baseName = rawBaseName.replace(/-\d+w$/, "");

      // Candidate derivative keys
      const candidateKeys = [
        baseDir ? `${baseDir}/${baseName}-${requestedWidth}w.webp` : `${baseName}-${requestedWidth}w.webp`,
        baseDir ? `${baseDir}/optimized/${baseName}-${requestedWidth}w.webp` : `optimized/${baseName}-${requestedWidth}w.webp`,
        baseDir.includes("/original") ? `${baseDir.replace("/original", "/optimized")}/${baseName}-${requestedWidth}w.webp` : null,
      ].filter((k): k is string => Boolean(k));

      for (const candKey of candidateKeys) {
        try {
          const preOptS3Data = await getS3Object(candKey);
          const candEtag = preOptS3Data.etag || `"${crypto.createHash("md5").update(preOptS3Data.buffer).digest("hex")}"`;

          setMemoryCache(memoryCacheKey, {
            buffer: preOptS3Data.buffer,
            contentType: "image/webp",
            etag: candEtag,
            cachedAt: Date.now(),
          });

          if (ifNoneMatch && ifNoneMatch === candEtag) {
            return new NextResponse(null, { status: 304 });
          }

          return new NextResponse(new Uint8Array(preOptS3Data.buffer), {
            status: 200,
            headers: {
              "Content-Type": "image/webp",
              "Content-Length": String(preOptS3Data.buffer.byteLength),
              "Cache-Control": "public, max-age=31536000, immutable",
              "ETag": candEtag,
              "Vary": "Accept",
              "X-Image-Cache": "HIT-S3-DERIVATIVE",
            },
          });
        } catch {
          // Pre-optimized derivative not found; continue searching
        }
      }
    }

    // 4. Generate Derivative on the fly, save to S3 permanently, and return
    let inFlight = IN_FLIGHT_PROMISES.get(memoryCacheKey);
    if (!inFlight) {
      inFlight = (async () => {
        const s3Data = await getS3Object(s3Key);
        let imageBuffer = s3Data.buffer;
        const lowerKey = s3Key.toLowerCase();

        // Check if source is HEIC/HEIF
        const isHeic =
          lowerKey.endsWith(".heic") ||
          lowerKey.endsWith(".heif") ||
          s3Data.contentType.toLowerCase().includes("heic") ||
          s3Data.contentType.toLowerCase().includes("heif");

        if (isHeic) {
          try {
            imageBuffer = await convertHeicToJpeg(imageBuffer);
          } catch (convErr) {
            console.warn(`[Image Proxy] HEIC conversion fallback for ${s3Key}:`, convErr);
          }
        }

        const targetW = requestedWidth || 1200;
        const targetQuality = requestedQuality ? Math.min(Math.max(requestedQuality, 60), 95) : 84;

        const webpBuffer = await sharp(imageBuffer)
          .rotate()
          .resize(targetW, null, {
            withoutEnlargement: true,
            fit: "inside",
          })
          .webp({ quality: targetQuality, effort: 4 })
          .toBuffer();

        const generatedEtag = `"${crypto.createHash("md5").update(webpBuffer).digest("hex")}"`;

        // Save generated derivative back to S3 in the background so future requests never need Sharp
        if (isS3Configured() && requestedWidth) {
          const parts = s3Key.split("/");
          const fileName = parts.pop() || "";
          const baseDir = parts.join("/");
          const dotIdx = fileName.lastIndexOf(".");
          const rawBaseName = dotIdx !== -1 ? fileName.slice(0, dotIdx) : fileName;
          const baseName = rawBaseName.replace(/-\d+w$/, "");

          const derivativeS3Key = baseDir.includes("/original")
            ? `${baseDir.replace("/original", "/optimized")}/${baseName}-${requestedWidth}w.webp`
            : baseDir
            ? `${baseDir}/${baseName}-${requestedWidth}w.webp`
            : `${baseName}-${requestedWidth}w.webp`;

          const region = process.env.AWS_REGION || "ap-southeast-2";
          const bucket = process.env.AWS_S3_BUCKET_NAME || "insha-collection-assets";
          const accessKey = process.env.AWS_ACCESS_KEY_ID!.trim();
          const secretKey = process.env.AWS_SECRET_ACCESS_KEY!.trim();

          // Fire and forget upload so client response is not delayed
          uploadToS3Direct(
            webpBuffer,
            derivativeS3Key,
            "image/webp",
            bucket,
            region,
            accessKey,
            secretKey,
            "public, max-age=31536000, immutable"
          ).catch((upErr) => {
            console.warn(`[Image Proxy] Could not persist generated derivative ${derivativeS3Key}:`, upErr);
          });
        }

        return {
          buffer: webpBuffer,
          contentType: "image/webp",
          etag: generatedEtag,
        };
      })();

      IN_FLIGHT_PROMISES.set(memoryCacheKey, inFlight);
    }

    const result = await inFlight;
    IN_FLIGHT_PROMISES.delete(memoryCacheKey);

    setMemoryCache(memoryCacheKey, {
      buffer: result.buffer,
      contentType: result.contentType,
      etag: result.etag,
      cachedAt: Date.now(),
    });

    if (ifNoneMatch && ifNoneMatch === result.etag) {
      return new NextResponse(null, { status: 304 });
    }

    return new NextResponse(new Uint8Array(result.buffer), {
      status: 200,
      headers: {
        "Content-Type": "image/webp",
        "Content-Length": String(result.buffer.byteLength),
        "Cache-Control": "public, max-age=31536000, immutable",
        "ETag": result.etag,
        "Vary": "Accept",
        "X-Image-Cache": "MISS-GENERATED-AND-STORED",
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load image";
    console.error("[S3 Image Proxy Error]:", msg);
    return new NextResponse(`Image not found or error loading: ${msg}`, { status: 404 });
  }
}

