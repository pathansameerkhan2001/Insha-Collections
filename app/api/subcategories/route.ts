import { NextRequest, NextResponse } from "next/server";
import { subcategoryStore } from "@/lib/categories/subcategoryStore";
import { ProductCategory } from "@/lib/products/productTypes";

/**
 * Public Subcategories API
 * Read-only endpoint for storefront filtering and dynamic menus.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") as ProductCategory | null;

    if (category) {
      const names = subcategoryStore.getNamesByCategory(category);
      return NextResponse.json({
        success: true,
        category,
        subcategories: names,
      });
    }

    // Return all categories mapped to their string name lists
    const all = subcategoryStore.getAllWithCounts();
    const subcategoriesMap: Record<string, string[]> = {};

    for (const [cat, list] of Object.entries(all)) {
      subcategoriesMap[cat] = list.map((item) => item.name);
    }

    return NextResponse.json({
      success: true,
      subcategories: subcategoriesMap,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to fetch subcategories";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

// Reject mutation methods on public API with 405 Method Not Allowed
export async function POST() {
  return NextResponse.json(
    { success: false, error: "Method Not Allowed. Subcategory management requires admin authentication." },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { success: false, error: "Method Not Allowed. Subcategory management requires admin authentication." },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: "Method Not Allowed. Subcategory management requires admin authentication." },
    { status: 405 }
  );
}
