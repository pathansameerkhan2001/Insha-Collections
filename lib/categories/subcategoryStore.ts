import fs from "fs";
import path from "path";
import { CATEGORY_SUBCATEGORIES } from "@/data/catalog";
import { productStore } from "@/lib/products/productStore";
import { ProductCategory } from "@/lib/products/productTypes";
import {
  isDynamoConfigured,
  dynamoGetAllSubcategories,
  dynamoPutSubcategory,
  dynamoDeleteSubcategory,
} from "@/lib/aws/dynamoService";

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
  private loadLocalData(): Record<ProductCategory, SubCategoryRecord[]> {
    const initialMap: Record<ProductCategory, SubCategoryRecord[]> = {
      jewellery: [],
      korean: [],
      dresses: [],
      materials: [],
      handlooms: [],
      beauty: [],
    };

    try {
      if (fs.existsSync(SUBCATEGORIES_FILE)) {
        const raw = fs.readFileSync(SUBCATEGORIES_FILE, "utf8");
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          for (const catKey of Object.keys(initialMap) as ProductCategory[]) {
            if (Array.isArray(parsed[catKey])) {
              initialMap[catKey] = parsed[catKey];
            }
          }
          return initialMap;
        }
      }
    } catch (err) {
      console.warn("Could not read local subcategories.json:", err);
    }

    return initialMap;
  }

  private saveLocalData(data: Record<ProductCategory, SubCategoryRecord[]>) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const tempFilePath = `${SUBCATEGORIES_FILE}.tmp.${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      fs.writeFileSync(tempFilePath, JSON.stringify(data, null, 2), "utf8");
      fs.renameSync(tempFilePath, SUBCATEGORIES_FILE);
    } catch (err) {
      console.error("Failed to write local subcategories.json:", err);
    }
  }

  private async fetchAllRawRecords(): Promise<SubCategoryRecord[]> {
    if (isDynamoConfigured()) {
      try {
        const items = await dynamoGetAllSubcategories();
        return items as SubCategoryRecord[];
      } catch (err) {
        console.error("DynamoDB GetAllSubcategories failed, falling back to local:", err);
      }
    }

    const localMap = this.loadLocalData();
    const records: SubCategoryRecord[] = [];
    for (const list of Object.values(localMap)) {
      records.push(...list);
    }
    return records;
  }

  public async getAllWithCounts(): Promise<Record<ProductCategory, SubCategoryWithCount[]>> {
    const records = await this.fetchAllRawRecords();
    const allProducts = await productStore.getAll();

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

    // Build subcategory count map from products
    const countMap = new Map<string, number>();
    for (const p of allProducts) {
      if (p.category && p.subCategory) {
        const key = `${p.category.toLowerCase()}:::${p.subCategory.trim().toLowerCase()}`;
        countMap.set(key, (countMap.get(key) || 0) + 1);
      }
    }

    // Group records by category
    for (const record of records) {
      if (result[record.categoryId]) {
        const key = `${record.categoryId.toLowerCase()}:::${record.name.trim().toLowerCase()}`;
        result[record.categoryId].push({
          ...record,
          productCount: countMap.get(key) || 0,
        });
      }
    }

    // Deterministic sorting by name
    for (const cat of categories) {
      result[cat].sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }

  public async getByCategory(category: ProductCategory): Promise<SubCategoryRecord[]> {
    const all = await this.getAllWithCounts();
    return all[category] || [];
  }

  public async getNamesByCategory(category: ProductCategory): Promise<string[]> {
    const subs = await this.getByCategory(category);
    return subs.map((s) => s.name);
  }

  public async create(categoryId: ProductCategory, name: string): Promise<SubCategoryRecord> {
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

    const currentList = await this.getByCategory(categoryId);
    const isDuplicate = currentList.some(
      (s) => s.name.toLowerCase() === trimmed.toLowerCase()
    );

    if (isDuplicate) {
      throw new Error(`Subcategory "${trimmed}" already exists under this category.`);
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

    if (isDynamoConfigured()) {
      try {
        await dynamoPutSubcategory(newRecord);
      } catch (err) {
        console.error("DynamoDB PutSubcategory failed:", err);
        throw err;
      }
    }

    try {
      const localData = this.loadLocalData();
      localData[categoryId] = [...(localData[categoryId] || []), newRecord];
      this.saveLocalData(localData);
    } catch {
      // Non-blocking in serverless
    }

    return newRecord;
  }

  public async update(
    categoryId: ProductCategory,
    oldNameOrId: string,
    newName: string
  ): Promise<{ subcategory: SubCategoryRecord; affectedProductsCount: number }> {
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

    const categoryList = await this.getByCategory(categoryId);
    const currentSub = categoryList.find(
      (s) => s.id === oldNameOrId || s.name.toLowerCase() === oldNameOrId.toLowerCase()
    );

    if (!currentSub) {
      throw new Error(`Subcategory "${oldNameOrId}" not found in category.`);
    }

    const isDuplicate = categoryList.some(
      (s) => s.id !== currentSub.id && s.name.toLowerCase() === trimmedNew.toLowerCase()
    );

    if (isDuplicate) {
      throw new Error(`Another subcategory named "${trimmedNew}" already exists under this category.`);
    }

    const now = new Date().toISOString();
    const oldName = currentSub.name;

    const updatedSub: SubCategoryRecord = {
      ...currentSub,
      name: trimmedNew,
      updatedAt: now,
    };

    if (isDynamoConfigured()) {
      try {
        await dynamoPutSubcategory(updatedSub);
      } catch (err) {
        console.error("DynamoDB updateSubcategory failed:", err);
        throw err;
      }
    }

    // Cascade update to matching products
    const affectedProductsCount = await productStore.updateProductSubcategory(
      categoryId,
      oldName,
      trimmedNew
    );

    try {
      const localData = this.loadLocalData();
      const idx = (localData[categoryId] || []).findIndex((s) => s.id === currentSub.id);
      if (idx !== -1) {
        localData[categoryId][idx] = updatedSub;
        this.saveLocalData(localData);
      }
    } catch {
      // Non-blocking
    }

    return {
      subcategory: updatedSub,
      affectedProductsCount,
    };
  }

  public async delete(
    categoryId: ProductCategory,
    nameOrId: string
  ): Promise<{ success: boolean; name: string }> {
    const categoryList = await this.getByCategory(categoryId);
    const sub = categoryList.find(
      (s) => s.id === nameOrId || s.name.toLowerCase() === nameOrId.toLowerCase()
    );

    if (!sub) {
      throw new Error(`Subcategory "${nameOrId}" not found in category.`);
    }

    const productCount = await productStore.countBySubCategory(categoryId, sub.name);

    if (productCount > 0) {
      throw new Error(
        `Cannot delete: This subcategory is currently used by ${productCount} product(s). Please reassign those products before deleting.`
      );
    }

    if (isDynamoConfigured()) {
      try {
        await dynamoDeleteSubcategory(sub.id);
      } catch (err) {
        console.error(`DynamoDB deleteSubcategory(${sub.id}) failed:`, err);
        throw err;
      }
    }

    try {
      const localData = this.loadLocalData();
      localData[categoryId] = (localData[categoryId] || []).filter((s) => s.id !== sub.id);
      this.saveLocalData(localData);
    } catch {
      // Non-blocking
    }

    return { success: true, name: sub.name };
  }

  public async reassignAndDelete(
    categoryId: ProductCategory,
    oldNameOrId: string,
    targetNameOrId: string
  ): Promise<{ success: boolean; reassignedCount: number; deletedName: string }> {
    const categoryList = await this.getByCategory(categoryId);
    const oldSub = categoryList.find(
      (s) => s.id === oldNameOrId || s.name.toLowerCase() === oldNameOrId.toLowerCase()
    );

    if (!oldSub) {
      throw new Error(`Subcategory to delete "${oldNameOrId}" not found.`);
    }

    const targetSub = categoryList.find(
      (s) => s.id === targetNameOrId || s.name.toLowerCase() === targetNameOrId.toLowerCase()
    );

    if (!targetSub) {
      throw new Error(`Target replacement subcategory "${targetNameOrId}" not found in category.`);
    }

    if (oldSub.id === targetSub.id) {
      throw new Error("Replacement subcategory must be different from the subcategory being deleted.");
    }

    // 1. Reassign products in product store
    const reassignedCount = await productStore.reassignProductSubcategory(
      categoryId,
      oldSub.name,
      targetSub.name
    );

    // 2. Delete old subcategory
    if (isDynamoConfigured()) {
      try {
        await dynamoDeleteSubcategory(oldSub.id);
      } catch (err) {
        console.error(`DynamoDB deleteSubcategory(${oldSub.id}) failed:`, err);
        throw err;
      }
    }

    try {
      const localData = this.loadLocalData();
      localData[categoryId] = (localData[categoryId] || []).filter((s) => s.id !== oldSub.id);
      this.saveLocalData(localData);
    } catch {
      // Non-blocking
    }

    return {
      success: true,
      reassignedCount,
      deletedName: oldSub.name,
    };
  }
}

export const subcategoryStore = new SubcategoryStore();
