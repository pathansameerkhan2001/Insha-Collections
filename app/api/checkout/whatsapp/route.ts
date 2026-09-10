import { NextRequest, NextResponse } from "next/server";
import { findProductById } from "@/data/catalog";
import { productStore } from "@/lib/products/productStore";
import { getStorefrontImageUrl } from "@/lib/products/productTypes";
import {
  CustomerDetails,
  OrderItemDetails,
  FullOrderPayload,
  generateOrderReference,
  formatWhatsAppOrderMessage,
  getWhatsAppOrderUrl,
  OrderType,
  PaymentMethod,
} from "@/utils/whatsapp";

interface RequestItemInput {
  productId?: string;
  id?: string;
  quantity: number;
}

interface RequestBody {
  customer: CustomerDetails;
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
    const orderType: OrderType = customer.orderType === "gift" ? "gift" : "myself";
    const cleanName = (customer.fullName || "").trim();
    const cleanMobile = (customer.mobile || "").replace(/\D/g, "").slice(0, 10);
    const cleanAddress = (customer.address || "").trim();
    const cleanCity = (customer.city || "").trim();
    const cleanState = (customer.state || "").trim();
    const cleanPincode = (customer.pincode || "").replace(/\D/g, "").slice(0, 6);
    const cleanInstructions = (customer.instructions || "").trim();
    const paymentMethod: PaymentMethod = customer.paymentMethod === "online" ? "online" : "cod";
    const cleanPaymentRef = (customer.paymentReference || "").trim();

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

    // Validate Payment Reference / UTR for Online Payment
    if (paymentMethod === "online" && (!cleanPaymentRef || cleanPaymentRef.length < 4)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid Payment Reference / UTR number for Online Payment." },
        { status: 400 }
      );
    }

    // 2. Validate Cart Items Independently Against Catalog Source of Truth
    const validatedItems: OrderItemDetails[] = [];

    // Determine request origin for public asset URLs
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
    const proto = req.headers.get("x-forwarded-proto") || "https";
    const requestOrigin = host ? `${proto}://${host}` : process.env.SITE_URL || "https://inshacollections.in";

    for (const rawItem of items) {
      const pId = rawItem.productId || rawItem.id;
      if (!pId) {
        return NextResponse.json(
          { success: false, error: "Missing product identifier in cart item." },
          { status: 400 }
        );
      }

      const catalogProduct = (await productStore.getById(pId)) || findProductById(pId);
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

      // Use verified catalog price and attributes
      const unitPrice = catalogProduct.price;
      const subtotal = unitPrice * qty;
      const imgUrl = getStorefrontImageUrl(catalogProduct);

      validatedItems.push({
        id: catalogProduct.id,
        name: catalogProduct.name,
        category: catalogProduct.category,
        subCategory: catalogProduct.subCategory,
        description: catalogProduct.description,
        price: unitPrice,
        quantity: qty,
        subtotal,
        image: imgUrl,
        productUrl: `${requestOrigin}/#shop-by-category`,
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
    const subtotalAmount = validatedItems.reduce((sum, it) => sum + it.subtotal, 0);
    const shippingAmount = 0;
    const discountAmount = 0;
    const totalAmount = subtotalAmount + shippingAmount - discountAmount;

    // 3. Generate Collision-Resistant Unique Order Reference
    const orderId = generateOrderReference();

    const orderPayload: FullOrderPayload = {
      orderId,
      customer: {
        fullName: cleanName,
        mobile: cleanMobile,
        address: cleanAddress,
        city: cleanCity,
        state: cleanState,
        pincode: cleanPincode,
        instructions: cleanInstructions || undefined,
        orderType,
        paymentMethod,
        paymentReference: paymentMethod === "online" ? cleanPaymentRef : undefined,
      },
      items: validatedItems,
      totalItems,
      subtotal: subtotalAmount,
      shipping: shippingAmount,
      discount: discountAmount,
      totalAmount,
      timestamp: new Date().toISOString(),
    };

    // 4. Construct WhatsApp formatted order text and URL
    const formattedMessage = formatWhatsAppOrderMessage(orderPayload, requestOrigin);
    const whatsappUrl = getWhatsAppOrderUrl(formattedMessage);

    return NextResponse.json({
      success: true,
      orderId,
      whatsappUrl,
      orderMessage: formattedMessage,
      totalAmount,
      totalItems,
      subtotal: subtotalAmount,
      shipping: shippingAmount,
      discount: discountAmount,
      customer: {
        fullName: cleanName,
        mobile: cleanMobile,
        orderType,
        paymentMethod,
        paymentReference: paymentMethod === "online" ? cleanPaymentRef : undefined,
      },
    });
  } catch (error) {
    console.error("[Order API] Unexpected error during checkout processing:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { success: false, error: "We couldn't process your order right now. Please try again." },
      { status: 500 }
    );
  }
}
