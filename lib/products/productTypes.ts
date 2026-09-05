export type ProductCategory =
  | "jewellery"
  | "korean"
  | "dresses"
  | "materials"
  | "handlooms"
  | "beauty";

export type ProductStatus = "Active" | "Draft" | "Out of Stock";

export interface ProductImageInfo {
  url: string;
  key?: string;
  filename?: string;
  mimeType?: string;
  alt?: string;
  isS3?: boolean;
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
 * reliable, and browser-renderable image URL.
 */
export function normalizeImageUrl(
  image: string | ProductImageInfo | null | undefined
): string {
  if (!image) return "";

  const raw = typeof image === "string" ? image.trim() : (image.url || image.key || "").trim();
  if (!raw) return "";

  // 1. Direct private S3 URLs (e.g. https://insha-collection-assets.s3.../products/...)
  const s3Pattern = /^https?:\/\/([^/]+\.s3[.-][^/]+\.amazonaws\.com|s3[.-][^/]+\.amazonaws\.com\/[^/]+|insha-collection-assets\.s3\.amazonaws\.com)\/(.+)$/i;
  const match = raw.match(s3Pattern);
  if (match && match[2]) {
    const s3Key = match[2].replace(/^\/+/, "");
    return `/api/images/s3/${s3Key}`;
  }

  // 2. Bare S3 object key (e.g. products/jewel-2/real/...)
  if (raw.startsWith("products/")) {
    return `/api/images/s3/${raw}`;
  }

  // 3. Local paths (/images/..., /uploads/..., /api/images/s3/...) or external URLs
  return raw;
}

/**
 * Returns the URL for storefront card display:
 * 1. AI Showcase Image (clean hero image for card)
 * 2. First Real / Original Product Image (if no AI image)
 * 3. Legacy mainImage / image
 * 4. Safe luxury default fallback
 */
export function getStorefrontImageUrl(product: {
  showcaseImage?: string | ProductImageInfo;
  realImages?: Array<string | ProductImageInfo>;
  mainImage?: string;
  image?: string;
}): string {
  if (product.showcaseImage) {
    const norm = normalizeImageUrl(product.showcaseImage);
    if (norm) return norm;
  }

  if (product.realImages && product.realImages.length > 0) {
    const firstReal = product.realImages[0];
    const norm = normalizeImageUrl(firstReal);
    if (norm) return norm;
  }

  const legacyFallback = product.mainImage || product.image;
  if (legacyFallback) {
    const norm = normalizeImageUrl(legacyFallback);
    if (norm) return norm;
  }

  return "/images/prod-gold-ring.jpg";
}

/**
 * Returns all real / original product images for Quick View:
 * 1. realImages list (all original admin photos, in exact order)
 * 2. Legacy mainImage / image
 * 3. AI Showcase image (fallback if no real image exists)
 * 4. Safe luxury default fallback
 */
export function getQuickViewImageUrls(product: {
  showcaseImage?: string | ProductImageInfo;
  realImages?: Array<string | ProductImageInfo>;
  mainImage?: string;
  image?: string;
}): string[] {
  if (product.realImages && product.realImages.length > 0) {
    const urls = product.realImages
      .map(normalizeImageUrl)
      .filter((u): u is string => Boolean(u && u.length > 0));

    if (urls.length > 0) return urls;
  }

  const legacyFallback = product.mainImage || product.image;
  if (legacyFallback) {
    const norm = normalizeImageUrl(legacyFallback);
    if (norm) return [norm];
  }

  if (product.showcaseImage) {
    const norm = normalizeImageUrl(product.showcaseImage);
    if (norm) return [norm];
  }

  return ["/images/prod-gold-ring.jpg"];
}
