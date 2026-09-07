import { NextRequest, NextResponse } from "next/server";
import { productStore } from "@/lib/products/productStore";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const subCategory = searchParams.get("subCategory") || undefined;
    const query = searchParams.get("query") || undefined;

    // Public API returns only active or in-stock products
    const allProducts = productStore.getAll({
      category,
      subCategory,
      query,
    });

    const publicItems = allProducts.filter((p) => p.status !== "Draft");

    return NextResponse.json(
      {
        success: true,
        count: publicItems.length,
        products: publicItems,
      },
      {
        headers: NO_CACHE_HEADERS,
      }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error fetching public products";
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
