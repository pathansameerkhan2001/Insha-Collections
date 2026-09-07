import { NextRequest, NextResponse } from "next/server";
import { productStore } from "@/lib/products/productStore";
import { CreateProductDTO } from "@/lib/products/productTypes";

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
    const status = searchParams.get("status") || undefined;
    const query = searchParams.get("query") || undefined;
    const featured = searchParams.get("featured") === "true" ? true : undefined;

    const products = productStore.getAll({
      category,
      subCategory,
      status,
      query,
      featured,
    });

    const summary = productStore.getCategorySummary();

    return NextResponse.json(
      {
        success: true,
        count: products.length,
        products,
        summary,
      },
      {
        headers: NO_CACHE_HEADERS,
      }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch products";
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateProductDTO;

    const hasImage = Boolean(
      body.showcaseImage ||
      (body.realImages && body.realImages.length > 0) ||
      (body.images && body.images.length > 0) ||
      body.mainImage
    );

    if (!body || !body.name || !body.category || !body.description || body.price === undefined || !hasImage) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: Product Name, Category, Description, Price, and at least one image are required.",
        },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const newProduct = productStore.create(body);

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        product: newProduct,
      },
      { status: 201, headers: NO_CACHE_HEADERS }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create product";
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
