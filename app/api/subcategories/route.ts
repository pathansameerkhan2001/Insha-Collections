import { NextRequest, NextResponse } from "next/server";
import { subcategoryStore } from "@/lib/categories/subcategoryStore";
import { ProductCategory } from "@/lib/products/productTypes";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

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
      return NextResponse.json(
        {
          success: true,
          category,
          subcategories: names,
        },
        { headers: NO_CACHE_HEADERS }
      );
    }

    // Return all categories mapped to their string name lists
    const all = subcategoryStore.getAllWithCounts();
    const subcategoriesMap: Record<string, string[]> = {};

    for (const [cat, list] of Object.entries(all)) {
      subcategoriesMap[cat] = list.map((item) => item.name);
    }

    return NextResponse.json(
      {
        success: true,
        subcategories: subcategoriesMap,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to fetch subcategories";
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

// Reject mutation methods on public API with 405 Method Not Allowed
export async function POST() {
  return NextResponse.json(
    { success: false, error: "Method Not Allowed. Subcategory management requires admin authentication." },
    { status: 405, headers: NO_CACHE_HEADERS }
  );
}

export async function PUT() {
  return NextResponse.json(
    { success: false, error: "Method Not Allowed. Subcategory management requires admin authentication." },
    { status: 405, headers: NO_CACHE_HEADERS }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: "Method Not Allowed. Subcategory management requires admin authentication." },
    { status: 405, headers: NO_CACHE_HEADERS }
  );
}
