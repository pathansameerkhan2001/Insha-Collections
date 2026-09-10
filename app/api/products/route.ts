import { NextRequest, NextResponse } from "next/server";
import { productStore } from "@/lib/products/productStore";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const subCategory = searchParams.get("subCategory") || undefined;
    const query = searchParams.get("query") || undefined;

    // Public API returns only active or in-stock products
    const allProducts = await productStore.getAll({
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
        headers: CACHE_HEADERS,
      }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error fetching public products";
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500, headers: CACHE_HEADERS }
    );
  }
}
