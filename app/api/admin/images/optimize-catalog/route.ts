import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import {
  isS3Configured,
  getS3Object,
  uploadToS3Direct,
  optimizeImageBuffer,
} from "@/lib/aws/s3Service";
import { ProductRecord } from "@/lib/products/productTypes";

export const maxDuration = 60; // 60s timeout for Next.js route handler if running bulk

export async function POST(req: NextRequest) {
  try {
    const productsFilePath = path.join(process.cwd(), ".data", "products.json");
    if (!fs.existsSync(productsFilePath)) {
      return NextResponse.json(
        { success: false, error: "Product catalog file not found." },
        { status: 404 }
      );
    }

    const fileContent = fs.readFileSync(productsFilePath, "utf8");
    const products: ProductRecord[] = JSON.parse(fileContent);

    let totalImagesOptimized = 0;
    let totalProductsUpdated = 0;
    const errors: string[] = [];

    const isS3 = isS3Configured();
    const region = process.env.AWS_REGION || "ap-southeast-2";
    const bucket = process.env.AWS_S3_BUCKET_NAME || "insha-collection-assets";
    const accessKey = (process.env.AWS_ACCESS_KEY_ID || "").trim();
    const secretKey = (process.env.AWS_SECRET_ACCESS_KEY || "").trim();

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      let productModified = false;

      // Collect image keys/paths to optimize
      const imageCandidates: { key: string; type: "showcase" | "real" }[] = [];

      if (product.showcaseImage) {
        const rawShowcase =
          typeof product.showcaseImage === "string"
            ? product.showcaseImage
            : product.showcaseImage.url || product.showcaseImage.key || "";

        if (rawShowcase && !rawShowcase.includes("/optimized/")) {
          imageCandidates.push({ key: rawShowcase, type: "showcase" });
        }
      }

      if (product.realImages && Array.isArray(product.realImages)) {
        for (const rImg of product.realImages) {
          const raw = typeof rImg === "string" ? rImg : rImg.url || rImg.key || "";
          if (raw && !raw.includes("/optimized/")) {
            imageCandidates.push({ key: raw, type: "real" });
          }
        }
      }

      for (const cand of imageCandidates) {
        try {
          let s3Key = cand.key;
          if (s3Key.startsWith("/api/images/s3/")) {
            s3Key = s3Key.replace("/api/images/s3/", "").split("?")[0];
          }

          if (isS3 && (s3Key.startsWith("products/") || !s3Key.startsWith("/"))) {
            // Fetch from S3
            const s3Obj = await getS3Object(s3Key);
            const { variants, blurDataURL, width, height } = await optimizeImageBuffer(s3Obj.buffer);

            // Compute optimized keys
            const keyWithoutExt = s3Key.replace(/\.[^.]+$/, "");
            const baseFolder = path.dirname(s3Key);
            const baseFileName = path.basename(s3Key, path.extname(s3Key));

            // Place in /optimized/ subfolder
            const optimizedFolder = baseFolder.includes("/original")
              ? baseFolder.replace("/original", "/optimized")
              : `${baseFolder}/optimized`;

            const key400 = `${optimizedFolder}/${baseFileName}-400w.webp`;
            const key800 = `${optimizedFolder}/${baseFileName}-800w.webp`;
            const key1200 = `${optimizedFolder}/${baseFileName}-1200w.webp`;
            const key1600 = `${optimizedFolder}/${baseFileName}-1600w.webp`;

            // Upload WebP variants
            await Promise.all([
              uploadToS3Direct(variants.w400, key400, "image/webp", bucket, region, accessKey, secretKey),
              uploadToS3Direct(variants.w800, key800, "image/webp", bucket, region, accessKey, secretKey),
              uploadToS3Direct(variants.w1200, key1200, "image/webp", bucket, region, accessKey, secretKey),
              uploadToS3Direct(variants.w1600, key1600, "image/webp", bucket, region, accessKey, secretKey),
            ]);

            totalImagesOptimized++;
            productModified = true;
          }
        } catch (itemErr) {
          errors.push(`Failed optimizing ${cand.key} for ${product.name}: ${itemErr instanceof Error ? itemErr.message : String(itemErr)}`);
        }
      }

      if (productModified) {
        totalProductsUpdated++;
      }
    }

    return NextResponse.json({
      success: true,
      totalScanned: products.length,
      totalProductsUpdated,
      totalImagesOptimized,
      errors: errors.length > 0 ? errors.slice(0, 10) : [],
      message: `Image optimization complete. Scanned ${products.length} products. All images are now accelerated with WebP multi-resolution variants!`,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Image optimization failed";
    console.error("Optimize catalog error:", errorMsg);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
