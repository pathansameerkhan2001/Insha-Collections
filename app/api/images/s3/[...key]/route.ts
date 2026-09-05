import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import crypto from "crypto";
import { getS3Object, convertHeicToJpeg, isS3Configured, uploadToS3Direct } from "@/lib/aws/s3Service";

interface RouteParams {
  params: Promise<{
    key: string[];
  }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    if (!resolvedParams?.key || resolvedParams.key.length === 0) {
      return new NextResponse("Invalid S3 image key", { status: 400 });
    }

    const rawKey = resolvedParams.key.map(decodeURIComponent).join("/");
    const s3Key = rawKey.split("?")[0].split("#")[0].replace(/^\/+/, "");
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

    // Check if client provided conditional ETag
    const ifNoneMatch = req.headers.get("if-none-match");

    // Case 1: The key itself is already an optimized WebP derivative
    if (s3Key.includes("/optimized/") && s3Key.toLowerCase().endsWith(".webp")) {
      const s3Data = await getS3Object(s3Key);

      if (s3Data.etag && ifNoneMatch && ifNoneMatch === s3Data.etag) {
        return new NextResponse(null, { status: 304 });
      }

      const headers: Record<string, string> = {
        "Content-Type": "image/webp",
        "Content-Length": String(s3Data.buffer.byteLength),
        "Cache-Control": "public, max-age=31536000, immutable",
        "Vary": "Accept",
      };
      if (s3Data.etag) headers["ETag"] = s3Data.etag;

      return new NextResponse(new Uint8Array(s3Data.buffer), {
        status: 200,
        headers,
      });
    }

    // Case 2: Target width requested and an optimized derivative might already exist in S3
    if (requestedWidth && (requestedWidth === 400 || requestedWidth === 800 || requestedWidth === 1200 || requestedWidth === 1600)) {
      const potentialOptimizedKey = s3Key
        .replace("/original/", "/optimized/")
        .replace(/\.[^.]+$/, `-${requestedWidth}w.webp`);

      if (potentialOptimizedKey !== s3Key && potentialOptimizedKey.includes("/optimized/")) {
        try {
          const cachedS3Data = await getS3Object(potentialOptimizedKey);
          if (cachedS3Data.etag && ifNoneMatch && ifNoneMatch === cachedS3Data.etag) {
            return new NextResponse(null, { status: 304 });
          }

          const headers: Record<string, string> = {
            "Content-Type": "image/webp",
            "Content-Length": String(cachedS3Data.buffer.byteLength),
            "Cache-Control": "public, max-age=31536000, immutable",
            "Vary": "Accept",
          };
          if (cachedS3Data.etag) headers["ETag"] = cachedS3Data.etag;

          return new NextResponse(new Uint8Array(cachedS3Data.buffer), {
            status: 200,
            headers,
          });
        } catch {
          // Pre-optimized derivative not found; continue to on-the-fly Sharp optimization
        }
      }
    }

    // Case 3: Fetch original image and optimize on-the-fly using Sharp
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

    // Process with Sharp into WebP
    let sharpInstance = sharp(imageBuffer).rotate();

    // Apply target width resizing if specified, or constrain enormous raw originals (>1600px)
    const targetW = requestedWidth || 1200;
    sharpInstance = sharpInstance.resize(targetW, null, {
      withoutEnlargement: true,
      fit: "inside",
    });

    const targetQuality = requestedQuality ? Math.min(Math.max(requestedQuality, 60), 95) : 82;
    const webpBuffer = await sharpInstance.webp({ quality: targetQuality, effort: 4 }).toBuffer();

    // Compute strong ETag for cached delivery
    const generatedEtag = `"${crypto.createHash("md5").update(webpBuffer).digest("hex")}"`;

    if (ifNoneMatch && ifNoneMatch === generatedEtag) {
      return new NextResponse(null, { status: 304 });
    }

    const headers: Record<string, string> = {
      "Content-Type": "image/webp",
      "Content-Length": String(webpBuffer.byteLength),
      "Cache-Control": "public, max-age=31536000, immutable",
      "ETag": generatedEtag,
      "Vary": "Accept",
    };

    return new NextResponse(new Uint8Array(webpBuffer), {
      status: 200,
      headers,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load image";
    console.error("[S3 Image Proxy Error]:", msg);
    return new NextResponse(`Image not found or error loading: ${msg}`, { status: 404 });
  }
}
