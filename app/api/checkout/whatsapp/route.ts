import { NextRequest, NextResponse } from "next/server";
import { findProductById } from "@/data/catalog";
import {
  generateOrderReference,
  dispatchWhatsAppOrder,
  OrderPayload,
  ValidatedOrderItem,
  CustomerOrderDetails,
} from "@/utils/whatsapp-cloud";

interface RequestItemInput {
  productId?: string;
  id?: string;
  quantity: number;
}

interface RequestBody {
  customer: CustomerOrderDetails;
  items: RequestItemInput[];
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RequestBody;

    if (!body || !body.customer || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid order submission. Missing customer or cart details." },
        { status: 400 }
      );
    }

    const { customer, items } = body;

    // 1. Validate Customer Data
    const cleanName = (customer.fullName || "").trim();
    const cleanMobile = (customer.mobile || "").replace(/\D/g, "").slice(0, 10);
    const cleanAddress = (customer.address || "").trim();
    const cleanCity = (customer.city || "").trim();
    const cleanState = (customer.state || "").trim();
    const cleanPincode = (customer.pincode || "").replace(/\D/g, "").slice(0, 6);
    const cleanInstructions = (customer.instructions || "").trim();

    if (!cleanName || cleanName.length < 2) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid full name (minimum 2 characters)." },
        { status: 400 }
      );
    }

    if (!cleanMobile || !/^[6-9]\d{9}$/.test(cleanMobile)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid 10-digit Indian mobile number." },
        { status: 400 }
      );
    }

    if (!cleanAddress || cleanAddress.length < 5) {
      return NextResponse.json(
        { success: false, error: "Please enter a complete delivery address." },
        { status: 400 }
      );
    }

    if (!cleanCity) {
      return NextResponse.json(
        { success: false, error: "Please enter your city." },
        { status: 400 }
      );
    }

    if (!cleanState) {
      return NextResponse.json(
        { success: false, error: "Please select your state." },
        { status: 400 }
      );
    }

    if (!cleanPincode || cleanPincode.length !== 6) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid 6-digit postal pincode." },
        { status: 400 }
      );
    }

    // 2. Validate Cart Items Independently Against Catalog Source of Truth
    const validatedItems: ValidatedOrderItem[] = [];

    for (const rawItem of items) {
      const pId = rawItem.productId || rawItem.id;
      if (!pId) {
        return NextResponse.json(
          { success: false, error: "Missing product identifier in cart item." },
          { status: 400 }
        );
      }

      const catalogProduct = findProductById(pId);
      if (!catalogProduct) {
        return NextResponse.json(
          { success: false, error: `Product ID '${pId}' is not found in our current catalog.` },
          { status: 400 }
        );
      }

      const qty = Math.floor(Number(rawItem.quantity));
      if (isNaN(qty) || qty < 1) {
        return NextResponse.json(
          { success: false, error: `Invalid quantity for product ${catalogProduct.name}.` },
          { status: 400 }
        );
      }

      // Use the verified catalog price
      const unitPrice = catalogProduct.price;
      const subtotal = unitPrice * qty;

      validatedItems.push({
        id: catalogProduct.id,
        name: catalogProduct.name,
        price: unitPrice,
        quantity: qty,
        subtotal,
        image: catalogProduct.image,
      });
    }

    if (validatedItems.length === 0) {
      return NextResponse.json(
        { success: false, error: "Your cart has no valid products." },
        { status: 400 }
      );
    }

    // Calculate totals server-side
    const totalItems = validatedItems.reduce((sum, it) => sum + it.quantity, 0);
    const totalAmount = validatedItems.reduce((sum, it) => sum + it.subtotal, 0);

    // 3. Generate Collision-Resistant Unique Order Reference
    const orderId = generateOrderReference();

    const orderPayload: OrderPayload = {
      orderId,
      customer: {
        fullName: cleanName,
        mobile: cleanMobile,
        address: cleanAddress,
        city: cleanCity,
        state: cleanState,
        pincode: cleanPincode,
        instructions: cleanInstructions || undefined,
      },
      items: validatedItems,
      totalItems,
      totalAmount,
      timestamp: new Date().toISOString(),
    };

    // Determine request origin for public asset URLs
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
    const proto = req.headers.get("x-forwarded-proto") || "https";
    const requestOrigin = host ? `${proto}://${host}` : undefined;

    // 4. Dispatch to WhatsApp Business Cloud API
    const dispatchResult = await dispatchWhatsAppOrder(orderPayload, requestOrigin);

    if (!dispatchResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "We couldn't send your order right now. Please try again.",
          orderId,
        },
        { status: 502 }
      );
    }

    // Masked customer mobile for response security (e.g. "98*****210")
    const maskedMobile =
      cleanMobile.length === 10
        ? `${cleanMobile.slice(0, 2)}*****${cleanMobile.slice(7)}`
        : cleanMobile;

    return NextResponse.json({
      success: true,
      orderId,
      totalAmount,
      totalItems,
      customer: {
        fullName: cleanName,
        mobile: maskedMobile,
      },
      message: "Order successfully delivered to Insha Collections on WhatsApp.",
    });
  } catch (error) {
    console.error("[Order API] Unexpected error during checkout processing:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { success: false, error: "We couldn't send your order right now. Please try again." },
      { status: 500 }
    );
  }
}
