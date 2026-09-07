import { NextRequest, NextResponse } from "next/server";
import { productStore } from "@/lib/products/productStore";
import { UpdateProductDTO } from "@/lib/products/productTypes";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const product = productStore.getById(id);

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }

    return NextResponse.json(
      { success: true, product },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error fetching product";
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = (await req.json()) as UpdateProductDTO;

    const updated = productStore.update(id, body);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Product updated successfully",
        product: updated,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error updating product";
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const deleted = productStore.delete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Product not found or already deleted" },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Product deleted successfully",
        id,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error deleting product";
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
