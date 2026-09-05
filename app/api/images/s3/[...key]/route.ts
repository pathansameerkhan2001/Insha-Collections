import { NextRequest, NextResponse } from "next/server";
import { getS3Object, convertHeicToJpeg } from "@/lib/aws/s3Service";

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

    const s3Key = resolvedParams.key.map(decodeURIComponent).join("/");

    // Fetch from S3 using AWS SigV4 GET
    const s3Data = await getS3Object(s3Key);

    let imageBuffer = s3Data.buffer;
    let contentType = s3Data.contentType;

    // Check if the file is HEIC/HEIF (either by extension or MIME type)
    const lowerKey = s3Key.toLowerCase();
    const isHeic =
      lowerKey.endsWith(".heic") ||
      lowerKey.endsWith(".heif") ||
      contentType.toLowerCase().includes("heic") ||
      contentType.toLowerCase().includes("heif");

    if (isHeic) {
      try {
        imageBuffer = await convertHeicToJpeg(imageBuffer);
        contentType = "image/jpeg";
      } catch (convErr) {
        console.warn(`[Image Proxy] Failed on-the-fly HEIC conversion for ${s3Key}:`, convErr);
      }
    } else if (lowerKey.endsWith(".png")) {
      contentType = "image/png";
    } else if (lowerKey.endsWith(".webp")) {
      contentType = "image/webp";
    } else if (lowerKey.endsWith(".jpg") || lowerKey.endsWith(".jpeg")) {
      contentType = "image/jpeg";
    }

    // Support Conditional GET (ETag caching)
    const ifNoneMatch = req.headers.get("if-none-match");
    if (s3Data.etag && ifNoneMatch && ifNoneMatch === s3Data.etag) {
      return new NextResponse(null, { status: 304 });
    }

    // Return the secure image stream
    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Content-Length": String(imageBuffer.byteLength),
      "Cache-Control": "public, max-age=31536000, immutable",
    };

    if (s3Data.etag) {
      headers["ETag"] = s3Data.etag;
    }

    return new NextResponse(new Uint8Array(imageBuffer), {
      status: 200,
      headers,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load image";
    console.error("[S3 Image Proxy Error]:", msg);
    return new NextResponse(`Image not found or error loading: ${msg}`, { status: 404 });
  }
}
