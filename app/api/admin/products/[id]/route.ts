import { NextRequest, NextResponse } from "next/server";
import { productStore } from "@/lib/products/productStore";
import { UpdateProductDTO } from "@/lib/products/productTypes";

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
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error fetching product";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
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
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      product: updated,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error updating product";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const deleted = productStore.delete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Product not found or already deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
      id,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Error deleting product";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
