import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { uploadProductImage } from "@/lib/aws/s3Service";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/heic",
  "image/heif",
  "image/webp",
  "application/octet-stream", // Frequently sent by mobile Safari/iOS for HEIC files
];

const ALLOWED_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".heic",
  ".heif",
  ".webp",
  ".JPG",
  ".JPEG",
  ".PNG",
  ".HEIC",
  ".HEIF",
  ".WEBP",
];

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB limit

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as string) || "general";
    const productId = (formData.get("productId") as string) || "new";
    const imageType = (formData.get("imageType") as "showcase" | "real" | "general") || "real";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No image file provided." },
        { status: 400 }
      );
    }

    const fileExt = path.extname(file.name || "").toLowerCase();
    const isMimeValid = ALLOWED_MIME_TYPES.includes((file.type || "").toLowerCase());
    const isExtValid = ALLOWED_EXTENSIONS.map((e) => e.toLowerCase()).includes(fileExt);

    // Validate format (checks MIME and Extension)
    if (!isMimeValid && !isExtValid) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file format (${file.type || fileExt}). Supported formats: JPG, JPEG, PNG, HEIC, HEIF, WebP.`,
        },
        { status: 400 }
      );
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: `File size exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(2)}MB).`,
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Normalize MIME type for HEIC/HEIF or octet-stream
    let normalizedMime = file.type || "image/jpeg";
    if (fileExt === ".heic" || fileExt === ".heif") {
      normalizedMime = "image/heic";
    } else if (fileExt === ".png") {
      normalizedMime = "image/png";
    } else if (fileExt === ".webp") {
      normalizedMime = "image/webp";
    } else if (fileExt === ".jpg" || fileExt === ".jpeg") {
      normalizedMime = "image/jpeg";
    }

    const result = await uploadProductImage(
      buffer,
      file.name,
      normalizedMime,
      category,
      productId,
      imageType
    );

    return NextResponse.json({
      success: true,
      url: result.url,
      key: result.key,
      isS3: result.isS3,
      mimeType: result.mimeType,
      filename: result.originalName,
      imageType,
      message: result.message,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Upload failed";
    console.error("Image upload API error:", errorMsg);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
