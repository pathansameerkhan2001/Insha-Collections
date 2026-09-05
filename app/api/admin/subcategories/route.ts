import { NextRequest, NextResponse } from "next/server";
import { subcategoryStore } from "@/lib/categories/subcategoryStore";
import { ProductCategory } from "@/lib/products/productTypes";
import { verifyAdminSessionOrReject } from "@/lib/auth/serverAuth";

const VALID_CATEGORIES: ProductCategory[] = [
  "jewellery",
  "korean",
  "dresses",
  "materials",
  "handlooms",
  "beauty",
];

/**
 * GET /api/admin/subcategories
 * Retrieve all categories with their subcategories and live product usage counts.
 */
export async function GET(req: NextRequest) {
  const authError = verifyAdminSessionOrReject(req);
  if (authError) return authError;

  try {
    const subcategories = subcategoryStore.getAllWithCounts();
    return NextResponse.json({
      success: true,
      subcategories,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to fetch subcategories";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

/**
 * POST /api/admin/subcategories
 * Create a new subcategory under a parent category.
 * Body: { category: ProductCategory, name: string }
 */
export async function POST(req: NextRequest) {
  const authError = verifyAdminSessionOrReject(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { category, name } = body;

    if (!category || !VALID_CATEGORIES.includes(category as ProductCategory)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid category. Allowed values: ${VALID_CATEGORIES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Subcategory name is required." },
        { status: 400 }
      );
    }

    const newSub = subcategoryStore.create(category as ProductCategory, name);

    return NextResponse.json(
      {
        success: true,
        message: `Subcategory "${newSub.name}" created successfully.`,
        subcategory: newSub,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to create subcategory";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
  }
}

/**
 * PUT /api/admin/subcategories
 * Rename a subcategory and propagate the update to all products currently using it.
 * Body: { category: ProductCategory, oldName: string, newName: string }
 */
export async function PUT(req: NextRequest) {
  const authError = verifyAdminSessionOrReject(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { category, oldName, newName } = body;

    if (!category || !VALID_CATEGORIES.includes(category as ProductCategory)) {
      return NextResponse.json(
        { success: false, error: "Invalid parent category." },
        { status: 400 }
      );
    }

    if (!oldName || typeof oldName !== "string" || !oldName.trim()) {
      return NextResponse.json(
        { success: false, error: "Current subcategory name (oldName) is required." },
        { status: 400 }
      );
    }

    if (!newName || typeof newName !== "string" || !newName.trim()) {
      return NextResponse.json(
        { success: false, error: "New subcategory name (newName) is required." },
        { status: 400 }
      );
    }

    const { subcategory, affectedProductsCount } = subcategoryStore.update(
      category as ProductCategory,
      oldName,
      newName
    );

    return NextResponse.json({
      success: true,
      message: `Subcategory renamed to "${subcategory.name}". ${affectedProductsCount} product(s) updated.`,
      subcategory,
      affectedProductsCount,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to rename subcategory";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 400 });
  }
}

/**
 * DELETE /api/admin/subcategories
 * Delete an unused subcategory, or reassign products and delete.
 * Body: { category: ProductCategory, name: string, reassignTo?: string }
 */
export async function DELETE(req: NextRequest) {
  const authError = verifyAdminSessionOrReject(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { category, name, reassignTo } = body;

    if (!category || !VALID_CATEGORIES.includes(category as ProductCategory)) {
      return NextResponse.json(
        { success: false, error: "Invalid parent category." },
        { status: 400 }
      );
    }

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Subcategory name to delete is required." },
        { status: 400 }
      );
    }

    // If reassign target is provided, reassign products first and delete
    if (reassignTo && typeof reassignTo === "string" && reassignTo.trim()) {
      const result = subcategoryStore.reassignAndDelete(
        category as ProductCategory,
        name,
        reassignTo
      );

      return NextResponse.json({
        success: true,
        message: `Subcategory "${result.deletedName}" deleted. ${result.reassignedCount} product(s) reassigned to "${reassignTo}".`,
        reassignedCount: result.reassignedCount,
      });
    }

    // Normal delete: will throw if products are in use
    const result = subcategoryStore.delete(category as ProductCategory, name);

    return NextResponse.json({
      success: true,
      message: `Subcategory "${result.name}" deleted successfully.`,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to delete subcategory";
    const isInUse = errorMsg.includes("currently used by");

    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
        inUse: isInUse,
      },
      { status: 400 }
    );
  }
}
