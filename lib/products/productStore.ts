import fs from "fs";
import path from "path";
import {
  ALL_CATALOG_PRODUCTS,
  BEAUTY_SERVICES,
  ProductItem,
  ServiceItem,
} from "@/data/catalog";
import {
  CreateProductDTO,
  ProductCategory,
  ProductFilterOptions,
  ProductRecord,
  ProductStatus,
  UpdateProductDTO,
  normalizeImageUrl,
  getStorefrontImageUrl,
} from "./productTypes";
import {
  isDynamoConfigured,
  dynamoGetAllProducts,
  dynamoGetProductById,
  dynamoPutProduct,
  dynamoDeleteProduct,
} from "@/lib/aws/dynamoService";

// File storage path for offline development fallback
const DATA_DIR = path.join(process.cwd(), ".data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");

/**
 * Converts legacy ProductItem to unified ProductRecord
 */
function mapProductItemToRecord(item: ProductItem): ProductRecord {
  const realImgs = item.realImages && item.realImages.length > 0 ? item.realImages : [item.image];
  const normalizedReal = realImgs.map((r) =>
    typeof r === "string" ? normalizeImageUrl(r) : { ...r, url: normalizeImageUrl(r.url) }
  );
  const normalizedShowcase = item.showcaseImage
    ? typeof item.showcaseImage === "string"
      ? normalizeImageUrl(item.showcaseImage)
      : { ...item.showcaseImage, url: normalizeImageUrl(item.showcaseImage.url) }
    : undefined;

  const primaryStorefront = getStorefrontImageUrl({
    showcaseImage: normalizedShowcase,
    realImages: normalizedReal,
    mainImage: item.image,
  });

  return {
    id: item.id,
    name: item.name,
    slug: item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    category: item.category,
    subCategory: item.subCategory,
    description: item.description,
    shortDescription: item.description.slice(0, 120) + "...",
    price: item.price,
    salePrice: item.originalPrice,
    sku: `INSHA-${item.category.toUpperCase().slice(0, 3)}-${item.id.replace(/\D/g, "").padStart(3, "0")}`,
    stockQuantity: item.inStock ? 25 : 0,
    inStock: item.inStock,
    status: item.inStock ? "Active" : "Out of Stock",
    featured: (item.badge?.text === "BESTSELLER" || item.badge?.type === "maroon"),
    mainImage: primaryStorefront,
    images: normalizedReal.map((r) => (typeof r === "string" ? r : r.url)),
    showcaseImage: normalizedShowcase,
    realImages: normalizedReal,
    material: item.material,
    details: item.details,
    badge: item.badge,
    rating: item.rating,
    reviewsCount: item.reviewsCount,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

/**
 * Converts legacy ServiceItem to unified ProductRecord
 */
function mapServiceItemToRecord(item: ServiceItem): ProductRecord {
  const normImg = normalizeImageUrl(item.image);
  return {
    id: item.id,
    name: item.name,
    slug: item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    category: "beauty",
    subCategory: item.subCategory,
    description: item.description,
    shortDescription: item.description.slice(0, 120) + "...",
    price: item.price,
    sku: `INSHA-SRV-${item.id.replace(/\D/g, "").padStart(3, "0")}`,
    stockQuantity: 999,
    inStock: true,
    status: "Active",
    featured: (item.badge?.type === "maroon" || item.badge?.text === "PAMPER PACK"),
    mainImage: normImg,
    images: [normImg],
    showcaseImage: normImg,
    realImages: [normImg],
    duration: item.duration,
    benefits: item.benefits,
    badge: item.badge,
    rating: item.rating,
    reviewsCount: item.reviewsCount,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

function getInitialCatalog(): ProductRecord[] {
  const products = ALL_CATALOG_PRODUCTS.map(mapProductItemToRecord);
  const services = BEAUTY_SERVICES.map(mapServiceItemToRecord);
  return [...products, ...services];
}

function normalizeRecord(p: any): ProductRecord {
  const rawReal =
    p.realImages && p.realImages.length > 0
      ? p.realImages
      : p.images && p.images.length > 0
      ? p.images
      : p.mainImage
      ? [p.mainImage]
      : [];

  const normalizedReal = rawReal.map((r: any) =>
    typeof r === "string" ? normalizeImageUrl(r) : { ...r, url: normalizeImageUrl(r.url) }
  );

  const normalizedShowcase = p.showcaseImage
    ? typeof p.showcaseImage === "string"
      ? normalizeImageUrl(p.showcaseImage)
      : { ...p.showcaseImage, url: normalizeImageUrl(p.showcaseImage.url) }
    : undefined;

  const primaryStorefront = getStorefrontImageUrl({
    showcaseImage: normalizedShowcase,
    realImages: normalizedReal,
    mainImage: p.mainImage,
  });

  return {
    ...p,
    price: Number(p.price) || 0,
    salePrice: p.salePrice ? Number(p.salePrice) : undefined,
    stockQuantity: p.stockQuantity !== undefined ? Number(p.stockQuantity) : 10,
    inStock: p.inStock ?? true,
    featured: Boolean(p.featured),
    showcaseImage: normalizedShowcase,
    realImages: normalizedReal,
    mainImage: primaryStorefront,
    images: normalizedReal.map((r: any) => (typeof r === "string" ? r : r.url)),
  };
}

class ProductStore {
  private memoryCache: ProductRecord[] | null = null;
  private cacheExpiresAt: number = 0;
  private readonly CACHE_TTL_MS = 45000; // 45 seconds server memory cache

  public invalidateCache() {
    this.memoryCache = null;
    this.cacheExpiresAt = 0;
  }

  // Local file fallback for offline testing
  private loadLocalData(): ProductRecord[] {
    try {
      if (fs.existsSync(PRODUCTS_FILE)) {
        const raw = fs.readFileSync(PRODUCTS_FILE, "utf8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(normalizeRecord);
        }
      }
    } catch (err) {
      console.warn("Could not read local products.json:", err);
    }
    const initial = getInitialCatalog();
    this.saveLocalData(initial);
    return initial;
  }

  private saveLocalData(products: ProductRecord[]) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const tempFilePath = `${PRODUCTS_FILE}.tmp.${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      fs.writeFileSync(tempFilePath, JSON.stringify(products, null, 2), "utf8");
      fs.renameSync(tempFilePath, PRODUCTS_FILE);
    } catch (err) {
      console.error("Failed to write local products.json:", err);
    }
  }

  public async getAll(filter?: ProductFilterOptions): Promise<ProductRecord[]> {
    let items: ProductRecord[] = [];

    // Check memory cache first
    const now = Date.now();
    if (this.memoryCache && now < this.cacheExpiresAt) {
      items = [...this.memoryCache];
    } else {
      if (isDynamoConfigured()) {
        try {
          const dynamoItems = await dynamoGetAllProducts();
          items = dynamoItems.map(normalizeRecord);
        } catch (err) {
          console.error("DynamoDB getAll failed, falling back to local storage:", err);
          items = this.loadLocalData();
        }
      } else {
        items = this.loadLocalData();
      }

      // Deterministic sorting: Newest created/updated first
      items.sort((a, b) => {
        const timeA = new Date(a.createdAt || a.updatedAt || 0).getTime();
        const timeB = new Date(b.createdAt || b.updatedAt || 0).getTime();
        return timeB - timeA;
      });

      // Save to memory cache
      this.memoryCache = [...items];
      this.cacheExpiresAt = now + this.CACHE_TTL_MS;
    }

    if (!filter) return items;

    const { category, subCategory, status, query, featured } = filter;

    if (category && category !== "all") {
      items = items.filter((p) => p.category === category);
    }

    if (subCategory && subCategory !== "All") {
      items = items.filter(
        (p) => p.subCategory?.toLowerCase() === subCategory.toLowerCase()
      );
    }

    if (status && status !== "All") {
      items = items.filter((p) => p.status === status);
    }

    if (featured !== undefined) {
      items = items.filter((p) => p.featured === featured);
    }

    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.subCategory?.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.material?.toLowerCase().includes(q)
      );
    }

    return items;
  }

  public async getById(id: string): Promise<ProductRecord | null> {
    if (!id) return null;

    if (isDynamoConfigured()) {
      try {
        const item = await dynamoGetProductById(id);
        if (item) {
          return normalizeRecord(item);
        }
        return null;
      } catch (err) {
        console.error(`DynamoDB getById(${id}) failed, falling back to local:`, err);
      }
    }

    const localItems = this.loadLocalData();
    const found = localItems.find((p) => p.id === id);
    return found ? normalizeRecord(found) : null;
  }

  public async create(dto: CreateProductDTO): Promise<ProductRecord> {
    const now = new Date().toISOString();

    const categoryPrefix =
      dto.category === "jewellery"
        ? "jewel"
        : dto.category === "korean"
        ? "kor"
        : dto.category === "dresses"
        ? "dress"
        : dto.category === "materials"
        ? "mat"
        : dto.category === "handlooms"
        ? "hand"
        : "srv";

    const uniqueId = `${categoryPrefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const slug = dto.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const resolvedShowcase = dto.showcaseImage
      ? typeof dto.showcaseImage === "string"
        ? normalizeImageUrl(dto.showcaseImage)
        : { ...dto.showcaseImage, url: normalizeImageUrl(dto.showcaseImage.url) }
      : undefined;

    const rawReal =
      dto.realImages && dto.realImages.length > 0
        ? dto.realImages
        : dto.images && dto.images.length > 0
        ? dto.images
        : dto.mainImage
        ? [dto.mainImage]
        : [];

    const resolvedReal = rawReal.map((r) =>
      typeof r === "string" ? normalizeImageUrl(r) : { ...r, url: normalizeImageUrl(r.url) }
    );

    const primaryStorefront = getStorefrontImageUrl({
      showcaseImage: resolvedShowcase,
      realImages: resolvedReal,
      mainImage: dto.mainImage,
    });

    const newRecord: ProductRecord = {
      id: uniqueId,
      name: dto.name.trim(),
      slug,
      category: dto.category,
      subCategory: dto.subCategory || "General",
      description: dto.description.trim(),
      shortDescription: dto.shortDescription?.trim() || dto.description.slice(0, 120) + "...",
      price: Number(dto.price),
      salePrice: dto.salePrice ? Number(dto.salePrice) : undefined,
      sku:
        dto.sku?.trim() ||
        `INSHA-${dto.category.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-4)}`,
      stockQuantity: dto.stockQuantity !== undefined ? Number(dto.stockQuantity) : 10,
      inStock: dto.inStock ?? true,
      status: dto.status || (dto.inStock === false ? "Out of Stock" : "Active"),
      featured: Boolean(dto.featured),
      mainImage: primaryStorefront,
      images: resolvedReal.map((r) => (typeof r === "string" ? r : r.url)),
      showcaseImage: resolvedShowcase,
      realImages: resolvedReal,
      material: dto.material,
      details: dto.details,
      duration: dto.duration,
      benefits: dto.benefits,
      badge: dto.badge || (dto.featured ? { text: "NEW ARRIVAL", type: "gold" } : undefined),
      rating: 5.0,
      reviewsCount: 1,
      createdAt: now,
      updatedAt: now,
    };

    if (isDynamoConfigured()) {
      try {
        await dynamoPutProduct(newRecord);
      } catch (err) {
        console.error("DynamoDB PutProduct failed:", err);
        throw err;
      }
    }

    // Also update local copy for offline synchronization
    try {
      const localItems = this.loadLocalData();
      this.saveLocalData([newRecord, ...localItems]);
    } catch {
      // Non-blocking in serverless
    }

    this.invalidateCache();
    return newRecord;
  }

  public async update(id: string, dto: UpdateProductDTO): Promise<ProductRecord | null> {
    const current = await this.getById(id);
    if (!current) {
      return null;
    }

    const now = new Date().toISOString();

    const resolvedShowcase =
      dto.showcaseImage !== undefined
        ? dto.showcaseImage
          ? typeof dto.showcaseImage === "string"
            ? normalizeImageUrl(dto.showcaseImage)
            : { ...dto.showcaseImage, url: normalizeImageUrl(dto.showcaseImage.url) }
          : undefined
        : current.showcaseImage;

    const rawReal =
      dto.realImages !== undefined
        ? dto.realImages
        : dto.images !== undefined
        ? dto.images
        : current.realImages || (current.mainImage ? [current.mainImage] : []);

    const resolvedReal = rawReal.map((r) =>
      typeof r === "string" ? normalizeImageUrl(r) : { ...r, url: normalizeImageUrl(r.url) }
    );

    const primaryStorefront = getStorefrontImageUrl({
      showcaseImage: resolvedShowcase,
      realImages: resolvedReal,
      mainImage: dto.mainImage || current.mainImage,
    });

    const updatedRecord: ProductRecord = {
      ...current,
      name: dto.name !== undefined ? dto.name.trim() : current.name,
      slug:
        dto.name !== undefined
          ? dto.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
          : current.slug,
      category: (dto.category as ProductCategory) || current.category,
      subCategory: dto.subCategory !== undefined ? dto.subCategory : current.subCategory,
      description: dto.description !== undefined ? dto.description.trim() : current.description,
      shortDescription:
        dto.shortDescription !== undefined
          ? dto.shortDescription.trim()
          : current.shortDescription,
      price: dto.price !== undefined ? Number(dto.price) : current.price,
      salePrice:
        dto.salePrice !== undefined
          ? dto.salePrice ? Number(dto.salePrice) : undefined
          : current.salePrice,
      sku: dto.sku !== undefined ? dto.sku.trim() : current.sku,
      stockQuantity:
        dto.stockQuantity !== undefined ? Number(dto.stockQuantity) : current.stockQuantity,
      inStock: dto.inStock !== undefined ? dto.inStock : current.inStock,
      status: (dto.status as ProductStatus) || current.status,
      featured: dto.featured !== undefined ? dto.featured : current.featured,
      mainImage: primaryStorefront,
      images: resolvedReal.map((r) => (typeof r === "string" ? r : r.url)),
      showcaseImage: resolvedShowcase,
      realImages: resolvedReal,
      material: dto.material !== undefined ? dto.material : current.material,
      details: dto.details !== undefined ? dto.details : current.details,
      duration: dto.duration !== undefined ? dto.duration : current.duration,
      benefits: dto.benefits !== undefined ? dto.benefits : current.benefits,
      badge: dto.badge !== undefined ? dto.badge : current.badge,
      updatedAt: now,
    };

    if (isDynamoConfigured()) {
      try {
        await dynamoPutProduct(updatedRecord);
      } catch (err) {
        console.error(`DynamoDB update(${id}) failed:`, err);
        throw err;
      }
    }

    try {
      const localItems = this.loadLocalData();
      const idx = localItems.findIndex((p) => p.id === id);
      if (idx !== -1) {
        localItems[idx] = updatedRecord;
        this.saveLocalData(localItems);
      }
    } catch {
      // Non-blocking in serverless
    }

    this.invalidateCache();
    return updatedRecord;
  }

  public async delete(id: string): Promise<boolean> {
    if (!id) return false;

    if (isDynamoConfigured()) {
      try {
        await dynamoDeleteProduct(id);
      } catch (err) {
        console.error(`DynamoDB delete(${id}) failed:`, err);
        throw err;
      }
    }

    try {
      const localItems = this.loadLocalData();
      const filtered = localItems.filter((p) => p.id !== id);
      this.saveLocalData(filtered);
    } catch {
      // Non-blocking in serverless
    }

    this.invalidateCache();
    return true;
  }

  public async countBySubCategory(category: ProductCategory, subCategoryName: string): Promise<number> {
    const items = await this.getAll();
    const target = subCategoryName.trim().toLowerCase();
    return items.filter(
      (p) => p.category === category && p.subCategory?.trim().toLowerCase() === target
    ).length;
  }

  public async updateProductSubcategory(
    category: ProductCategory,
    oldSubCategory: string,
    newSubCategory: string
  ): Promise<number> {
    const items = await this.getAll();
    const targetOld = oldSubCategory.trim().toLowerCase();
    const trimmedNew = newSubCategory.trim();
    let affectedCount = 0;

    for (const p of items) {
      if (p.category === category && p.subCategory?.trim().toLowerCase() === targetOld) {
        await this.update(p.id, { id: p.id, subCategory: trimmedNew });
        affectedCount++;
      }
    }

    return affectedCount;
  }

  public async reassignProductSubcategory(
    category: ProductCategory,
    fromSubCategory: string,
    toSubCategory: string
  ): Promise<number> {
    return this.updateProductSubcategory(category, fromSubCategory, toSubCategory);
  }

  public async getDistinctSubCategoriesByCategory(category: ProductCategory): Promise<string[]> {
    const items = await this.getAll();
    const subCats = new Set<string>();
    for (const p of items) {
      if (p.category === category && p.subCategory && p.subCategory.trim()) {
        subCats.add(p.subCategory.trim());
      }
    }
    return Array.from(subCats);
  }

  public async getCategorySummary(): Promise<Record<string, number>> {
    const items = await this.getAll();
    const summary: Record<string, number> = {
      total: items.length,
      jewellery: 0,
      korean: 0,
      dresses: 0,
      materials: 0,
      handlooms: 0,
      beauty: 0,
      active: 0,
      draft: 0,
      outOfStock: 0,
    };

    for (const item of items) {
      if (summary[item.category] !== undefined) {
        summary[item.category]++;
      }
      if (item.status === "Active") summary.active++;
      else if (item.status === "Draft") summary.draft++;
      else if (item.status === "Out of Stock") summary.outOfStock++;
    }

    return summary;
  }
}

export const productStore = new ProductStore();
