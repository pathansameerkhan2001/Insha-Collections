import fs from "fs";
import path from "path";
import { CATEGORY_SUBCATEGORIES } from "@/data/catalog";
import { productStore } from "@/lib/products/productStore";
import { ProductCategory } from "@/lib/products/productTypes";

/**
 * Storage Architecture Note:
 * This subcategory store uses a JSON file (.data/subcategories.json) for the current development environment.
 * All storage operations are strictly encapsulated behind the SubcategoryStore interface/methods.
 * When deploying to serverless production environments (e.g., AWS Lambda, Vercel), this service layer
 * can be seamlessly migrated to Amazon DynamoDB or PostgreSQL without modifying API contracts or UI components.
 */

export interface SubCategoryRecord {
  id: string; // Stable slug/id, e.g. "jewellery-bridal-jewellery"
  name: string; // Display name, e.g. "Bridal Jewellery"
  categoryId: ProductCategory;
  createdAt: string;
  updatedAt: string;
}

export interface SubCategoryWithCount extends SubCategoryRecord {
  productCount: number;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const SUBCATEGORIES_FILE = path.join(DATA_DIR, "subcategories.json");

/**
 * Seed defaults: Comprehensive UNION of user-requested subcategories and existing catalog subcategories.
 */
const DEFAULT_CATEGORY_SUBCATEGORIES: Record<ProductCategory, string[]> = {
  jewellery: [
    "Bangles & Kadas",
    "Earrings",
    "Earrings / Jhumkas",
    "Rings",
    "Necklaces & Chokers",
    "Pendants & Chains",
    "Bracelets",
    "Anklets",
    "Maang Tikka",
    "Bridal Jewellery",
    "Nose Pins",
    "Hair Accessories",
    "Anti-Tarnish Jewellery",
  ],
  korean: [
    "Hair Accessories",
    "Hair Clips",
    "Scrunchies",
    "Pearl Accessories",
    "Bows",
    "Hair Pins",
    "Earrings",
    "Necklaces",
    "Rings",
    "Bracelets",
    "Korean Bags",
    "Korean Beauty Accessories",
    "Korean Fashion Accessories",
  ],
  dresses: [
    "Anarkali",
    "Kurti",
    "Kurtis",
    "Salwar Suit",
    "Salwar Suits",
    "Kurta Sets",
    "Party Wear",
    "Casual Wear",
    "Ethnic Wear",
    "Western Wear",
    "Festive Wear",
    "Designer Dresses",
    "Kids Dresses",
  ],
  materials: [
    "Cotton",
    "Silk",
    "Chanderi",
    "Linen",
    "Embroidered",
    "Printed",
    "Festive",
    "Bridal",
    "Georgette",
    "Traditional",
    "Designer",
  ],
  handlooms: [
    "Sarees",
    "Dupattas",
    "Bedsheets",
    "Curtains",
    "Cushion Covers",
    "Table Runners",
    "Home Decor",
    "Towels",
    "Sofa Covers",
    "Bed Covers",
    "Table Linen",
    "Throws",
    "Traditional Handloom",
  ],
  beauty: [
    "Facial",
    "Bridal Makeup",
    "Hair Services",
    "Hair Styling",
    "Manicure / Pedicure",
    "Spa",
    "Hair Treatment",
  ],
};

function generateSlug(category: string, name: string): string {
  const cleanName = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${category}-${cleanName || "sub"}`;
}

export class SubcategoryStore {
  private cache: Record<ProductCategory, SubCategoryRecord[]> | null = null;
  private lastLoadedMtime: number = 0;

  /**
   * Initializes or loads subcategory data from .data/subcategories.json.
   * Merges any missing default subcategories or subcategories currently in products.json.
   */
  private ensureDataLoaded(): Record<ProductCategory, SubCategoryRecord[]> {
    const initialMap: Record<ProductCategory, SubCategoryRecord[]> = {
      jewellery: [],
      korean: [],
      dresses: [],
      materials: [],
      handlooms: [],
      beauty: [],
    };

    const now = "2026-01-01T00:00:00.000Z";

    try {
      if (fs.existsSync(SUBCATEGORIES_FILE)) {
        const stats = fs.statSync(SUBCATEGORIES_FILE);
        const currentMtime = stats.mtimeMs;

        // If cache exists and file has not changed, return cache
        if (this.cache && this.lastLoadedMtime === currentMtime) {
          return this.cache;
        }

        const raw = fs.readFileSync(SUBCATEGORIES_FILE, "utf8");
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          for (const catKey of Object.keys(initialMap) as ProductCategory[]) {
            if (Array.isArray(parsed[catKey])) {
              initialMap[catKey] = parsed[catKey];
            }
          }
          this.cache = initialMap;
          this.lastLoadedMtime = currentMtime;
          return this.cache;
        }
      }
    } catch (err) {
      console.warn("Could not read subcategories.json, will initialize from defaults:", err);
    }

    // Merge in defaults and catalog subcategories to guarantee comprehensive seed
    const allCategories: ProductCategory[] = [
      "jewellery",
      "korean",
      "dresses",
      "materials",
      "handlooms",
      "beauty",
    ];

    let hasChanges = false;

    for (const cat of allCategories) {
      const existingNames = new Set(
        initialMap[cat].map((s) => s.name.trim().toLowerCase())
      );

      // 1. Check default list
      const defaults = DEFAULT_CATEGORY_SUBCATEGORIES[cat] || [];
      // 2. Check catalog.ts static list
      const catalogDefaults = CATEGORY_SUBCATEGORIES[cat] || [];
      // 3. Check actual products in store
      const distinctFromProducts = productStore.getDistinctSubCategoriesByCategory(cat);

      const combinedSeed = Array.from(
        new Set([...defaults, ...catalogDefaults, ...distinctFromProducts])
      );

      for (const name of combinedSeed) {
        const trimmed = name.trim();
        if (trimmed && !existingNames.has(trimmed.toLowerCase())) {
          existingNames.add(trimmed.toLowerCase());
          initialMap[cat].push({
            id: generateSlug(cat, trimmed),
            name: trimmed,
            categoryId: cat,
            createdAt: now,
            updatedAt: now,
          });
          hasChanges = true;
        }
      }
    }

    this.cache = initialMap;

    if (hasChanges || !fs.existsSync(SUBCATEGORIES_FILE)) {
      this.saveToFile(initialMap);
    }

    return initialMap;
  }

  private saveToFile(data: Record<ProductCategory, SubCategoryRecord[]>) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      // Safe atomic write via temporary file rename
      const tempFilePath = `${SUBCATEGORIES_FILE}.tmp.${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      fs.writeFileSync(tempFilePath, JSON.stringify(data, null, 2), "utf8");
      fs.renameSync(tempFilePath, SUBCATEGORIES_FILE);

      const stats = fs.statSync(SUBCATEGORIES_FILE);
      this.lastLoadedMtime = stats.mtimeMs;
      this.cache = data;
    } catch (err) {
      console.error("Failed to write subcategories.json:", err);
    }
  }

  /**
   * Retrieves all categories and their subcategories with live product counts.
   */
  public getAllWithCounts(): Record<ProductCategory, SubCategoryWithCount[]> {
    const data = this.ensureDataLoaded();
    const result: Record<ProductCategory, SubCategoryWithCount[]> = {
      jewellery: [],
      korean: [],
      dresses: [],
      materials: [],
      handlooms: [],
      beauty: [],
    };

    const categories: ProductCategory[] = [
      "jewellery",
      "korean",
      "dresses",
      "materials",
      "handlooms",
      "beauty",
    ];

    for (const cat of categories) {
      result[cat] = data[cat].map((sub) => ({
        ...sub,
        productCount: productStore.countBySubCategory(cat, sub.name),
      }));
    }

    return result;
  }

  /**
   * Retrieves all subcategories for a given category.
   */
  public getByCategory(category: ProductCategory): SubCategoryRecord[] {
    const data = this.ensureDataLoaded();
    return data[category] || [];
  }

  /**
   * Retrieves string subcategory names for dropdowns and filtering.
   */
  public getNamesByCategory(category: ProductCategory): string[] {
    const subs = this.getByCategory(category);
    return subs.map((s) => s.name);
  }

  /**
   * Creates a new subcategory under a parent category.
   */
  public create(categoryId: ProductCategory, name: string): SubCategoryRecord {
    const trimmed = (name || "").trim();

    if (!trimmed) {
      throw new Error("Subcategory name is required.");
    }
    if (trimmed.length < 2) {
      throw new Error("Subcategory name must be at least 2 characters long.");
    }
    if (trimmed.length > 60) {
      throw new Error("Subcategory name cannot exceed 60 characters.");
    }

    const data = this.ensureDataLoaded();
    const categoryList = data[categoryId] || [];

    // Duplicate check within same category (case-insensitive)
    const isDuplicate = categoryList.some(
      (s) => s.name.toLowerCase() === trimmed.toLowerCase()
    );

    if (isDuplicate) {
      throw new Error(
        `Subcategory "${trimmed}" already exists under this category.`
      );
    }

    const now = new Date().toISOString();
    const id = generateSlug(categoryId, trimmed);

    const newRecord: SubCategoryRecord = {
      id,
      name: trimmed,
      categoryId,
      createdAt: now,
      updatedAt: now,
    };

    data[categoryId] = [...categoryList, newRecord];
    this.cache = data;
    this.saveToFile(data);

    return newRecord;
  }

  /**
   * Renames a subcategory and cascades the change to all matching products.
   */
  public update(
    categoryId: ProductCategory,
    oldNameOrId: string,
    newName: string
  ): { subcategory: SubCategoryRecord; affectedProductsCount: number } {
    const trimmedNew = (newName || "").trim();

    if (!trimmedNew) {
      throw new Error("New subcategory name is required.");
    }
    if (trimmedNew.length < 2) {
      throw new Error("Subcategory name must be at least 2 characters long.");
    }
    if (trimmedNew.length > 60) {
      throw new Error("Subcategory name cannot exceed 60 characters.");
    }

    const data = this.ensureDataLoaded();
    const categoryList = data[categoryId] || [];

    const index = categoryList.findIndex(
      (s) =>
        s.id === oldNameOrId ||
        s.name.toLowerCase() === oldNameOrId.toLowerCase()
    );

    if (index === -1) {
      throw new Error(`Subcategory "${oldNameOrId}" not found in category.`);
    }

    const currentSub = categoryList[index];

    // Check if new name already exists in this category under a different entry
    const isDuplicate = categoryList.some(
      (s, i) =>
        i !== index && s.name.toLowerCase() === trimmedNew.toLowerCase()
    );

    if (isDuplicate) {
      throw new Error(
        `Another subcategory named "${trimmedNew}" already exists under this category.`
      );
    }

    const now = new Date().toISOString();
    const oldName = currentSub.name;

    const updatedSub: SubCategoryRecord = {
      ...currentSub,
      name: trimmedNew,
      updatedAt: now,
    };

    // 1. Update matching products in product store
    const affectedProductsCount = productStore.updateProductSubcategory(
      categoryId,
      oldName,
      trimmedNew
    );

    // 2. Update subcategory record
    const updatedList = [...categoryList];
    updatedList[index] = updatedSub;
    data[categoryId] = updatedList;

    this.cache = data;
    this.saveToFile(data);

    return {
      subcategory: updatedSub,
      affectedProductsCount,
    };
  }

  /**
   * Deletes a subcategory if it is not currently used by any products.
   * Throws error if products are using it.
   */
  public delete(
    categoryId: ProductCategory,
    nameOrId: string
  ): { success: boolean; name: string } {
    const data = this.ensureDataLoaded();
    const categoryList = data[categoryId] || [];

    const sub = categoryList.find(
      (s) =>
        s.id === nameOrId ||
        s.name.toLowerCase() === nameOrId.toLowerCase()
    );

    if (!sub) {
      throw new Error(`Subcategory "${nameOrId}" not found in category.`);
    }

    const productCount = productStore.countBySubCategory(categoryId, sub.name);

    if (productCount > 0) {
      throw new Error(
        `Cannot delete: This subcategory is currently used by ${productCount} product(s). Please reassign those products before deleting.`
      );
    }

    data[categoryId] = categoryList.filter((s) => s.id !== sub.id);
    this.cache = data;
    this.saveToFile(data);

    return { success: true, name: sub.name };
  }

  /**
   * Reassigns all products from old subcategory to target subcategory, then deletes the old subcategory.
   */
  public reassignAndDelete(
    categoryId: ProductCategory,
    oldNameOrId: string,
    targetNameOrId: string
  ): { success: boolean; reassignedCount: number; deletedName: string } {
    const data = this.ensureDataLoaded();
    const categoryList = data[categoryId] || [];

    const oldSub = categoryList.find(
      (s) =>
        s.id === oldNameOrId ||
        s.name.toLowerCase() === oldNameOrId.toLowerCase()
    );

    if (!oldSub) {
      throw new Error(`Subcategory to delete "${oldNameOrId}" not found.`);
    }

    const targetSub = categoryList.find(
      (s) =>
        s.id === targetNameOrId ||
        s.name.toLowerCase() === targetNameOrId.toLowerCase()
    );

    if (!targetSub) {
      throw new Error(
        `Target replacement subcategory "${targetNameOrId}" not found in category.`
      );
    }

    if (oldSub.id === targetSub.id) {
      throw new Error(
        "Replacement subcategory must be different from the subcategory being deleted."
      );
    }

    // 1. Reassign products in product store
    const reassignedCount = productStore.reassignProductSubcategory(
      categoryId,
      oldSub.name,
      targetSub.name
    );

    // 2. Remove old subcategory
    data[categoryId] = categoryList.filter((s) => s.id !== oldSub.id);
    this.cache = data;
    this.saveToFile(data);

    return {
      success: true,
      reassignedCount,
      deletedName: oldSub.name,
    };
  }
}

export const subcategoryStore = new SubcategoryStore();
