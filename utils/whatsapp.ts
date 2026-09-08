import { CartEntry } from "@/components/CartDrawer";

export type PaymentMethod = "cod" | "online";
export type OrderType = "myself" | "gift";

export interface CustomerDetails {
  fullName: string;
  mobile: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  instructions?: string;
  orderType: OrderType;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
}

export interface OrderItemDetails {
  id: string;
  name: string;
  category?: string;
  subCategory?: string;
  description?: string;
  price: number;
  quantity: number;
  subtotal: number;
  image: string;
  productUrl?: string;
}

export interface FullOrderPayload {
  orderId: string;
  customer: CustomerDetails;
  items: OrderItemDetails[];
  totalItems: number;
  subtotal: number;
  shipping: number;
  discount: number;
  totalAmount: number;
  timestamp?: string;
}

export const BUSINESS_WHATSAPP_NUMBER = "919618648050";

export const INDIAN_STATES: string[] = [
  "Andhra Pradesh",
  "Telangana",
  "Karnataka",
  "Tamil Nadu",
  "Maharashtra",
  "Delhi",
  "Kerala",
  "Gujarat",
  "Rajasthan",
  "Uttar Pradesh",
  "West Bengal",
  "Madhya Pradesh",
  "Punjab",
  "Haryana",
  "Bihar",
  "Odisha",
  "Goa",
  "Assam",
  "Jharkhand",
  "Chhattisgarh",
  "Himachal Pradesh",
  "Uttarakhand",
  "Jammu and Kashmir",
  "Puducherry",
  "Chandigarh",
  "Other",
];

/**
 * Format category identifier to human-friendly Title Case
 */
export function formatCategoryName(cat?: string): string {
  if (!cat) return "Jewellery";
  const lower = cat.toLowerCase();
  switch (lower) {
    case "jewellery":
      return "Jewellery";
    case "korean":
      return "Korean Items";
    case "dresses":
      return "Readymade Dresses";
    case "materials":
      return "Dress Materials";
    case "handlooms":
      return "Handlooms";
    case "beauty":
      return "Beauty & Salon";
    default:
      return cat.charAt(0).toUpperCase() + cat.slice(1);
  }
}

/**
 * Generates a collision-resistant unique Order Reference ID: INSH-YYYYMMDD-XXXX
 */
export function generateOrderReference(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const dateStr = `${year}${month}${day}`;

  // 4 random alphanumeric characters (uppercase)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let randomSuffix = "";
  for (let i = 0; i < 4; i++) {
    randomSuffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `INSH-${dateStr}-${randomSuffix}`;
}

/**
 * Resolves a public HTTPS image URL for WhatsApp messages.
 * Ensures no localhost or raw relative paths are sent.
 */
export function getPublicHttpsImageUrl(imagePath?: string, siteOrigin?: string): string {
  if (!imagePath) return "https://insha-collections.com/images/New-logo.jpeg";

  // If already absolute HTTPS URL
  if (imagePath.startsWith("https://")) {
    // Strip query parameters that might contain signed S3 secrets if any
    if (imagePath.includes("amazonaws.com") && imagePath.includes("X-Amz-Signature")) {
      const clean = imagePath.split("?")[0];
      return clean;
    }
    return imagePath;
  }

  // Prepend domain
  const domain = (
    siteOrigin ||
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://insha-collections.com"
  ).replace(/\/+$/, "");

  const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${domain}${cleanPath}`;
}

/**
 * Generates the clean, standardized WhatsApp order message matching the exact specification:
 *
 * 🛍️ ORDER FROM WEBSITE — INSHA COLLECTIONS
 *
 * Order ID: INSH-YYYYMMDD-XXXX
 *
 * Order Type: For Myself (or For Gift)
 *
 * PRODUCT 1
 * ...
 */
export function formatWhatsAppOrderMessage(
  payload: FullOrderPayload,
  siteOrigin?: string
): string {
  const { orderId, customer, items, totalItems, subtotal, shipping, discount, totalAmount } = payload;

  const baseSiteUrl = (
    siteOrigin ||
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://insha-collections.com"
  ).replace(/\/+$/, "");

  const orderTypeDisplay = customer.orderType === "gift" ? "For Gift" : "For Myself";

  let message = `🛍️ ORDER FROM WEBSITE — INSHA COLLECTIONS\n\n`;
  message += `Order ID: ${orderId}\n\n`;
  message += `Order Type: ${orderTypeDisplay}\n\n`;

  // Product blocks
  items.forEach((item, index) => {
    const itemNumber = index + 1;
    const catName = formatCategoryName(item.category);
    const subCatName = item.subCategory || catName;
    const desc = item.description?.trim() || "Handcrafted premium quality collection from Insha Collections.";
    const imageUrl = getPublicHttpsImageUrl(item.image, baseSiteUrl);
    const productPageUrl = item.productUrl || `${baseSiteUrl}/#shop-by-category`;

    message += `PRODUCT ${itemNumber}\n\n`;
    message += `Product Name: ${item.name}\n\n`;
    message += `Product ID: ${item.id}\n\n`;
    message += `Category: ${catName}\n\n`;
    message += `Subcategory: ${subCatName}\n\n`;
    message += `Description:\n${desc}\n\n`;
    message += `Price: ₹${item.price.toLocaleString("en-IN")}\n\n`;
    message += `Quantity: ${item.quantity}\n\n`;
    message += `Subtotal: ₹${item.subtotal.toLocaleString("en-IN")}\n\n`;
    message += `Product Image:\n${imageUrl}\n\n`;
    message += `Product Page:\n${productPageUrl}\n\n`;
  });

  // Order summary block
  message += `ORDER SUMMARY\n\n`;
  message += `Total Items: ${totalItems}\n`;
  message += `Subtotal: ₹${subtotal.toLocaleString("en-IN")}\n`;
  message += `Shipping: ₹${shipping.toLocaleString("en-IN")}\n`;
  message += `Discount: ₹${discount.toLocaleString("en-IN")}\n`;
  message += `TOTAL: ₹${totalAmount.toLocaleString("en-IN")}\n\n`;

  // Customer details block
  message += `CUSTOMER DETAILS\n\n`;
  message += `Name: ${customer.fullName.trim()}\n`;
  message += `Mobile: ${customer.mobile.trim()}\n\n`;
  message += `Address:\n${customer.address.trim()}\n\n`;
  message += `City: ${customer.city.trim()}\n`;
  message += `State: ${customer.state.trim()}\n`;
  message += `Pincode: ${customer.pincode.trim()}\n\n`;

  const instructionsText = customer.instructions && customer.instructions.trim()
    ? customer.instructions.trim()
    : "None";
  message += `Delivery Instructions:\n${instructionsText}\n\n`;
  message += `Order Type:\n${orderTypeDisplay}\n\n`;

  // Payment details block
  message += `PAYMENT DETAILS\n\n`;

  if (customer.paymentMethod === "online") {
    message += `Payment Method: Online Payment\n`;
    message += `Payment Reference / UTR: ${customer.paymentReference?.trim() || "N/A"}\n\n`;
  } else {
    message += `Payment Method: Cash on Delivery\n\n`;
  }

  // Closing note
  message += `Please confirm this order from Insha Collections.\n\n`;
  message += `Thank you for shopping with Insha Collections.`;

  return message;
}

/**
 * Returns the standard WhatsApp click-to-chat URL with properly URL-encoded text.
 */
export function getWhatsAppOrderUrl(message: string): string {
  return `https://wa.me/${BUSINESS_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Returns a customer-initiated WhatsApp concierge link to open a 24-hour customer service session with Insha Collections.
 */
export function generateConciergeSessionUrl(orderReference: string, customerName?: string): string {
  const greeting = customerName ? `Hello Insha Collections, I am ${customerName.trim()}.` : `Hello Insha Collections,`;
  const text = `${greeting} I just placed an order on your website (Order ID: ${orderReference}). Please let me know the confirmation and delivery timeline.`;
  return `https://wa.me/${BUSINESS_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
