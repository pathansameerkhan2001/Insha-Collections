import { CartEntry } from "@/components/CartDrawer";

export interface CustomerDetails {
  fullName: string;
  mobile: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  instructions?: string;
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
 * Generates the clean, structured WhatsApp order message matching the specification.
 */
export function generateWhatsAppMessage(
  customer: CustomerDetails,
  items: CartEntry[],
  orderReference?: string
): string {
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalAmount = items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  let message = `Hello Insha Collections,\n\nI would like to place an order.\n\n`;

  if (orderReference) {
    message += `*ORDER REFERENCE:* ${orderReference}\n\n`;
  }

  message += `*CUSTOMER DETAILS*\n`;
  message += `Name: ${customer.fullName.trim()}\n`;
  message += `Mobile: ${customer.mobile.trim()}\n\n`;

  message += `*DELIVERY ADDRESS*\n`;
  message += `Address: ${customer.address.trim()}\n`;
  message += `City: ${customer.city.trim()}\n`;
  message += `State: ${customer.state.trim()}\n`;
  message += `Pincode: ${customer.pincode.trim()}\n\n`;

  if (customer.instructions && customer.instructions.trim()) {
    message += `Delivery Instructions:\n${customer.instructions.trim()}\n\n`;
  }

  message += `*ORDER DETAILS*\n`;
  items.forEach((item, index) => {
    const itemSubtotal = item.product.price * item.quantity;
    message += `${index + 1}. ${item.product.name}\n`;
    message += `Qty: ${item.quantity} | Price: ₹${item.product.price.toLocaleString("en-IN")} | Subtotal: ₹${itemSubtotal.toLocaleString("en-IN")}\n\n`;
  });

  message += `*TOTAL ITEMS:* ${totalItems}\n`;
  message += `*TOTAL AMOUNT:* ₹${totalAmount.toLocaleString("en-IN")}\n\n`;
  message += `Please confirm my order and let me know the next steps.\n\n`;
  message += `Thank you,\nInsha Collections Customer`;

  return message;
}

/**
 * Returns a customer-initiated WhatsApp concierge link to open a 24-hour customer service session with Insha Collections.
 */
export function generateConciergeSessionUrl(orderReference: string, customerName?: string): string {
  const greeting = customerName ? `Hello Insha Collections, I am ${customerName.trim()}.` : `Hello Insha Collections,`;
  const text = `${greeting} I just placed an order on your website (Ref: ${orderReference}). Please let me know the confirmation and delivery timeline.`;
  return `https://wa.me/${BUSINESS_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

/**
 * Returns the standard WhatsApp click-to-chat URL with properly URL-encoded text.
 */
export function getWhatsAppOrderUrl(message: string): string {
  return `https://wa.me/${BUSINESS_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
