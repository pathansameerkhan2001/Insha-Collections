export type ProductCategory =
  | "jewellery"
  | "korean"
  | "dresses"
  | "materials"
  | "handlooms"
  | "beauty";

export type ProductStatus = "Active" | "Draft" | "Out of Stock";

export interface OptimizedImageVariants {
  w400?: string;
  w800?: string;
  w1200?: string;
  w1600?: string;
}

export interface ProductImageInfo {
  url: string;
  key?: string;
  originalKey?: string;
  filename?: string;
  mimeType?: string;
  alt?: string;
  isS3?: boolean;
  optimized?: OptimizedImageVariants;
  blurDataURL?: string;
  width?: number;
  height?: number;
}

export interface ProductRecord {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  subCategory: string;
  description: string;
  shortDescription?: string;
  price: number;
  salePrice?: number;
  sku?: string;
  stockQuantity: number;
  inStock: boolean;
  status: ProductStatus;
  featured: boolean;
  mainImage: string; // Primary storefront image URL (normalized)
  images: string[]; // All images array
  showcaseImage?: string | ProductImageInfo; // AI Showcase Image for storefront
  realImages?: Array<string | ProductImageInfo>; // Real / Original product photos for Quick View
  material?: string;
  details?: string[];
  duration?: string; // For Beauty & Salon services
  benefits?: string[]; // For Beauty & Salon services
  badge?: {
    text: string;
    type: "maroon" | "gold";
  };
  rating?: number;
  reviewsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDTO {
  name: string;
  category: ProductCategory;
  subCategory?: string;
  description: string;
  shortDescription?: string;
  price: number;
  salePrice?: number;
  sku?: string;
  stockQuantity?: number;
  inStock?: boolean;
  status?: ProductStatus;
  featured?: boolean;
  mainImage?: string;
  images?: string[];
  showcaseImage?: string | ProductImageInfo;
  realImages?: Array<string | ProductImageInfo>;
  material?: string;
  details?: string[];
  duration?: string;
  benefits?: string[];
  badge?: {
    text: string;
    type: "maroon" | "gold";
  };
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {
  id: string;
}

export interface ProductFilterOptions {
  category?: string;
  subCategory?: string;
  status?: string;
  query?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Normalizes any S3 key, direct S3 URL, or local path into a secure,
 * reliable, and optimized browser-renderable image URL.
 * Supports targetWidth for responsive derivative selection.
 */
export function normalizeImageUrl(
  image: string | ProductImageInfo | null | undefined,
  targetWidth?: 400 | 800 | 1200 | 1600 | number
): string {
  if (!image) return "";

  // Ignore array .map index numbers (e.g., 0, 1, 2) that are not valid target widths
  const validWidth =
    typeof targetWidth === "number" && (targetWidth === 400 || targetWidth === 800 || targetWidth === 1200 || targetWidth === 1600)
      ? targetWidth
      : undefined;

  // If object with pre-calculated optimized derivative
  if (typeof image === "object" && image !== null) {
    if (image.optimized && validWidth) {
      if (validWidth === 400 && image.optimized.w400) return image.optimized.w400;
      if (validWidth === 800 && image.optimized.w800) return image.optimized.w800;
      if (validWidth === 1200 && image.optimized.w1200) return image.optimized.w1200;
      if (validWidth === 1600 && image.optimized.w1600) return image.optimized.w1600;
    }
  }

  const raw = typeof image === "string" ? image.trim() : (image.url || image.key || "").trim();
  if (!raw) return "";

  // 1. Direct private S3 URLs (e.g. https://insha-collection-assets.s3.../products/...)
  const s3Pattern = /^https?:\/\/([^/]+\.s3[.-][^/]+\.amazonaws\.com|s3[.-][^/]+\.amazonaws\.com\/[^/]+|insha-collection-assets\.s3\.amazonaws\.com)\/(.+)$/i;
  const match = raw.match(s3Pattern);
  if (match && match[2]) {
    const s3Key = match[2].replace(/^\/+/, "").split("?")[0].split("#")[0];
    const widthParam = validWidth ? `?w=${validWidth}` : "";
    return `/api/images/s3/${s3Key}${widthParam}`;
  }

  // 2. Bare S3 object key (e.g. products/jewel-2/real/...)
  if (raw.startsWith("products/")) {
    const s3Key = raw.split("?")[0].split("#")[0];
    const widthParam = validWidth ? `?w=${validWidth}` : "";
    return `/api/images/s3/${s3Key}${widthParam}`;
  }

  // 3. Already an S3 API route (/api/images/s3/...)
  if (raw.startsWith("/api/images/s3/")) {
    const cleanPath = raw.split("?")[0].split("#")[0];
    if (validWidth) {
      return `${cleanPath}?w=${validWidth}`;
    }
    return raw;
  }

  // 4. Local uploads (/uploads/products/...)
  if (raw.startsWith("/uploads/products/")) {
    return raw;
  }

  return raw;
}

/**
 * Checks if a URL is an internal secure S3 delivery route
 */
export function isS3DeliveryUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.startsWith("/api/images/s3/");
}


/**
 * Returns the optimized URL for storefront card display:
 * 1. AI Showcase Image (400px/800px WebP derivative)
 * 2. First Real / Original Product Image (400px/800px WebP derivative)
 * 3. Legacy mainImage / image
 * 4. Safe luxury default fallback
 */
export function getStorefrontImageUrl(
  product: {
    showcaseImage?: string | ProductImageInfo;
    realImages?: Array<string | ProductImageInfo>;
    mainImage?: string;
    image?: string;
  },
  targetWidth: 400 | 800 = 400
): string {
  if (product.showcaseImage) {
    const norm = normalizeImageUrl(product.showcaseImage, targetWidth);
    if (norm) return norm;
  }

  if (product.realImages && product.realImages.length > 0) {
    const firstReal = product.realImages[0];
    const norm = normalizeImageUrl(firstReal, targetWidth);
    if (norm) return norm;
  }

  const legacyFallback = product.mainImage || product.image;
  if (legacyFallback) {
    const norm = normalizeImageUrl(legacyFallback, targetWidth);
    if (norm) return norm;
  }

  return "/images/prod-gold-ring.jpg";
}

/**
 * Returns all real / original product images for Quick View:
 * 1. realImages list (800px/1200px WebP derivatives)
 * 2. Legacy mainImage / image
 * 3. AI Showcase image (fallback if no real image exists)
 * 4. Safe luxury default fallback
 */
export function getQuickViewImageUrls(
  product: {
    showcaseImage?: string | ProductImageInfo;
    realImages?: Array<string | ProductImageInfo>;
    mainImage?: string;
    image?: string;
  },
  targetWidth: 400 | 800 | 1200 = 800
): string[] {
  if (product.realImages && product.realImages.length > 0) {
    const urls = product.realImages
      .map((img) => normalizeImageUrl(img, targetWidth))
      .filter((u): u is string => Boolean(u && u.length > 0));

    if (urls.length > 0) return urls;
  }

  const legacyFallback = product.mainImage || product.image;
  if (legacyFallback) {
    const norm = normalizeImageUrl(legacyFallback, targetWidth);
    if (norm) return [norm];
  }

  if (product.showcaseImage) {
    const norm = normalizeImageUrl(product.showcaseImage, targetWidth);
    if (norm) return [norm];
  }

  return ["/images/prod-gold-ring.jpg"];
}

/**
 * Luxury shimmer/blur placeholder for smooth progressive image loading
 */
export const LUXURY_BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI0Y1RUNFNSIvPjwvc3ZnPg==";
