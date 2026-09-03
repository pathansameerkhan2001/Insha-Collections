import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface CustomerOrderDetails {
  fullName: string;
  mobile: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  instructions?: string;
}

export interface ValidatedOrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  image: string;
}

export interface OrderPayload {
  orderId: string;
  customer: CustomerOrderDetails;
  items: ValidatedOrderItem[];
  totalItems: number;
  totalAmount: number;
  timestamp: string;
}

export interface WhatsAppCloudConfig {
  accessToken?: string;
  phoneNumberId?: string;
  businessAccountId?: string;
  apiVersion: string;
  businessNumber: string;
  siteUrl?: string;
  messagingMode: "template" | "session" | "auto";
  templateName?: string;
  templateLanguage: string;
  isSimulationMode: boolean;
}

/**
 * Reads server-side environment variables for WhatsApp Cloud API.
 * Never exposes these variables to client-side.
 */
export function getWhatsAppCloudConfig(): WhatsAppCloudConfig {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID?.trim();
  const apiVersion = process.env.WHATSAPP_API_VERSION?.trim() || "v21.0";
  const businessNumber = (process.env.BUSINESS_WHATSAPP_NUMBER?.trim() || "919618648050").replace(/\D/g, "");
  const siteUrl = process.env.SITE_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME?.trim();
  const templateLanguage = process.env.WHATSAPP_TEMPLATE_LANGUAGE?.trim() || "en_US";
  const messagingModeRaw = (process.env.WHATSAPP_MESSAGING_MODE?.trim() || "auto").toLowerCase();
  const messagingMode: "template" | "session" | "auto" =
    messagingModeRaw === "template" || messagingModeRaw === "session" ? messagingModeRaw : "auto";

  // If credentials are not supplied or simulation mode is explicitly enabled
  const isSimulationMode =
    process.env.WHATSAPP_SIMULATION_MODE === "true" || !accessToken || !phoneNumberId;

  return {
    accessToken,
    phoneNumberId,
    businessAccountId,
    apiVersion,
    businessNumber,
    siteUrl,
    messagingMode,
    templateName,
    templateLanguage,
    isSimulationMode,
  };
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

  // 4 random alphanumeric characters (crypto-safe, uppercase)
  const randomSuffix = crypto.randomBytes(3).toString("hex").toUpperCase().slice(0, 4);
  return `INSH-${dateStr}-${randomSuffix}`;
}

/**
 * Generates the clean, standardized order text message for Insha Collections.
 */
export function formatOrderSummaryText(order: OrderPayload): string {
  let message = `Hello Insha Collections,\n\nI would like to place an order.\n\n`;

  message += `*ORDER REFERENCE:* ${order.orderId}\n\n`;

  message += `*CUSTOMER DETAILS*\n`;
  message += `Name: ${order.customer.fullName.trim()}\n`;
  message += `Mobile: ${order.customer.mobile.trim()}\n\n`;

  message += `*DELIVERY ADDRESS*\n`;
  message += `Address: ${order.customer.address.trim()}\n`;
  message += `City: ${order.customer.city.trim()}\n`;
  message += `State: ${order.customer.state.trim()}\n`;
  message += `Pincode: ${order.customer.pincode.trim()}\n\n`;

  if (order.customer.instructions && order.customer.instructions.trim()) {
    message += `Delivery Instructions:\n${order.customer.instructions.trim()}\n\n`;
  }

  message += `*ORDER DETAILS*\n`;
  order.items.forEach((item, index) => {
    message += `${index + 1}. ${item.name}\n`;
    message += `Qty: ${item.quantity} | Price: ₹${item.price.toLocaleString("en-IN")} | Subtotal: ₹${item.subtotal.toLocaleString("en-IN")}\n\n`;
  });

  message += `*TOTAL ITEMS:* ${order.totalItems}\n`;
  message += `*TOTAL AMOUNT:* ₹${order.totalAmount.toLocaleString("en-IN")}\n\n`;
  message += `Please confirm my order and let me know the next steps.\n\n`;
  message += `Thank you,\nInsha Collections Customer`;

  return message;
}

/**
 * Resolves a product image path to an absolute HTTPS URL or uploads it to Meta Cloud API via /media.
 */
export async function resolveOrUploadProductImage(
  imagePath: string,
  config: WhatsAppCloudConfig,
  requestOrigin?: string
): Promise<{ link?: string; id?: string }> {
  // 1. If it's already an external absolute HTTPS URL
  if (imagePath.startsWith("https://")) {
    return { link: imagePath };
  }

  // 2. If SITE_URL or requestOrigin is available, construct public HTTPS URL
  const baseUrl = config.siteUrl || requestOrigin;
  if (baseUrl && baseUrl.startsWith("https://")) {
    const cleanBase = baseUrl.replace(/\/+$/, "");
    const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    return { link: `${cleanBase}${cleanPath}` };
  }

  // 3. If local asset and credentials exist, attempt to upload to Meta /media endpoint
  if (!config.isSimulationMode && config.accessToken && config.phoneNumberId) {
    try {
      const publicDir = path.join(process.cwd(), "public");
      const relativeClean = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
      const fullFilePath = path.join(publicDir, relativeClean);

      if (fs.existsSync(fullFilePath)) {
        const fileBuffer = fs.readFileSync(fullFilePath);
        const mimeType = imagePath.endsWith(".png") ? "image/png" : "image/jpeg";
        const filename = path.basename(fullFilePath);

        // Upload using standard FormData to Meta Graph API /media
        const formData = new FormData();
        const blob = new Blob([fileBuffer], { type: mimeType });
        formData.append("file", blob, filename);
        formData.append("type", mimeType);
        formData.append("messaging_product", "whatsapp");

        const mediaUploadUrl = `https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}/media`;
        const uploadRes = await fetch(mediaUploadUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.accessToken}`,
          },
          body: formData,
        });

        if (uploadRes.ok) {
          const mediaData = (await uploadRes.json()) as { id: string };
          if (mediaData?.id) {
            return { id: mediaData.id };
          }
        } else {
          const errText = await uploadRes.text();
          console.warn("[WhatsApp Cloud API] Media upload returned non-200, will fallback if possible:", uploadRes.status, errText.slice(0, 100));
        }
      }
    } catch (err) {
      console.warn("[WhatsApp Cloud API] Could not upload local media binary:", err instanceof Error ? err.message : String(err));
    }
  }

  // 4. Fallback to constructing link with best effort
  const fallbackHost = baseUrl || "https://insha-collections.com";
  const cleanBase = fallbackHost.replace(/\/+$/, "");
  const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return { link: `${cleanBase}${cleanPath}` };
}

/**
 * Sends a single WhatsApp message via Meta Cloud API.
 */
async function postToWhatsAppCloud(
  payload: Record<string, unknown>,
  config: WhatsAppCloudConfig
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  if (config.isSimulationMode) {
    console.log("[WhatsApp Cloud API] [SIMULATION MODE] Dispatched payload to:", config.businessNumber);
    return {
      success: true,
      data: {
        messaging_product: "whatsapp",
        contacts: [{ input: config.businessNumber, wa_id: config.businessNumber }],
        messages: [{ id: `wamid.SIMULATED_${Date.now()}` }],
      },
    };
  }

  const endpoint = `https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}/messages`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();

    if (!response.ok) {
      const errMessage = responseData?.error?.message || responseData?.error?.error_user_msg || `HTTP ${response.status}`;
      console.error("[WhatsApp Cloud API] Delivery failed:", {
        code: responseData?.error?.code,
        subcode: responseData?.error?.error_subcode,
        message: errMessage,
      });
      return { success: false, error: errMessage, data: responseData };
    }

    return { success: true, data: responseData };
  } catch (err) {
    const errMessage = err instanceof Error ? err.message : "Network error contacting Meta API";
    console.error("[WhatsApp Cloud API] Network error:", errMessage);
    return { success: false, error: errMessage };
  }
}

/**
 * Dispatches WhatsApp Template message with Header Image and Dynamic Body Parameters.
 * Follows Meta's official WhatsApp Business Messaging Guidelines.
 */
export async function sendTemplateOrderNotification(
  order: OrderPayload,
  config: WhatsAppCloudConfig,
  requestOrigin?: string
): Promise<{ success: boolean; error?: string }> {
  if (!config.templateName) {
    return { success: false, error: "WHATSAPP_TEMPLATE_NAME is not configured for template messaging mode." };
  }

  // Resolve header image from the primary/first item
  const primaryItem = order.items[0];
  const headerMedia = await resolveOrUploadProductImage(primaryItem.image, config, requestOrigin);

  // Compact items summary for template parameter (e.g. "1. Twist Hoops (Qty: 1), 2. Pearl Bangles (Qty: 2)")
  const itemsSummary = order.items
    .map((it, idx) => `${idx + 1}. ${it.name} x${it.quantity}`)
    .join("; ");

  const addressSummary = `${order.customer.address}, ${order.customer.city}, ${order.customer.state} - ${order.customer.pincode}`;

  // Build Meta Template Component Parameters
  const components: Array<Record<string, unknown>> = [];

  // Header component with actual product image
  if (headerMedia.id || headerMedia.link) {
    components.push({
      type: "header",
      parameters: [
        {
          type: "image",
          image: headerMedia.id ? { id: headerMedia.id } : { link: headerMedia.link },
        },
      ],
    });
  }

  // Body component with positional variables:
  // {{1}} = Customer Name
  // {{2}} = Order Reference
  // {{3}} = Items Summary
  // {{4}} = Total Amount
  // {{5}} = Delivery Address
  components.push({
    type: "body",
    parameters: [
      { type: "text", text: order.customer.fullName },
      { type: "text", text: order.orderId },
      { type: "text", text: itemsSummary },
      { type: "text", text: `₹${order.totalAmount.toLocaleString("en-IN")}` },
      { type: "text", text: addressSummary },
    ],
  });

  const templatePayload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: config.businessNumber,
    type: "template",
    template: {
      name: config.templateName,
      language: {
        code: config.templateLanguage,
      },
      components,
    },
  };

  const res = await postToWhatsAppCloud(templatePayload, config);
  return { success: res.success, error: res.error };
}

/**
 * Dispatches session-based media messages for every product in the cart, followed by consolidated order text.
 */
export async function sendSessionMediaAndTextOrder(
  order: OrderPayload,
  config: WhatsAppCloudConfig,
  requestOrigin?: string
): Promise<{ success: boolean; error?: string }> {
  // 1. Send Product Image(s) as actual WhatsApp media
  for (let i = 0; i < order.items.length; i++) {
    const item = order.items[i];
    const imageMedia = await resolveOrUploadProductImage(item.image, config, requestOrigin);

    const caption = `[${i + 1}/${order.items.length}] ${item.name}\nQty: ${item.quantity} | Price: ₹${item.price.toLocaleString("en-IN")} | Subtotal: ₹${item.subtotal.toLocaleString("en-IN")}\nRef: ${order.orderId}`;

    const mediaPayload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: config.businessNumber,
      type: "image",
      image: {
        ...(imageMedia.id ? { id: imageMedia.id } : { link: imageMedia.link }),
        caption,
      },
    };

    const mediaResult = await postToWhatsAppCloud(mediaPayload, config);
    if (!mediaResult.success) {
      console.warn(`[WhatsApp Cloud API] Warning: Image for item ${item.name} could not be sent:`, mediaResult.error);
    }
  }

  // 2. Send Consolidated Clean Order Details Text Message
  const textBody = formatOrderSummaryText(order);
  const textPayload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: config.businessNumber,
    type: "text",
    text: {
      preview_url: false,
      body: textBody,
    },
  };

  const textResult = await postToWhatsAppCloud(textPayload, config);
  return { success: textResult.success, error: textResult.error };
}

/**
 * Master Dispatcher: Sends order notification to business WhatsApp (+91 9618648050)
 * complying with Meta's messaging rules (template mode vs session mode).
 */
export async function dispatchWhatsAppOrder(
  order: OrderPayload,
  requestOrigin?: string
): Promise<{ success: boolean; orderId: string; error?: string }> {
  const config = getWhatsAppCloudConfig();

  // If template is explicitly configured or required by messaging mode
  if (config.messagingMode === "template" || (config.messagingMode === "auto" && config.templateName)) {
    const templateResult = await sendTemplateOrderNotification(order, config, requestOrigin);
    if (templateResult.success) {
      return { success: true, orderId: order.orderId };
    }

    // If template failed and we are in auto mode, attempt session-based media/text fallback
    if (config.messagingMode === "auto") {
      console.warn("[WhatsApp Cloud API] Template dispatch failed, falling back to session media/text dispatch:", templateResult.error);
      const sessionResult = await sendSessionMediaAndTextOrder(order, config, requestOrigin);
      return {
        success: sessionResult.success,
        orderId: order.orderId,
        error: sessionResult.error || templateResult.error,
      };
    }

    return { success: false, orderId: order.orderId, error: templateResult.error };
  }

  // Default / Session Mode: Send each product image as WhatsApp media followed by structured text
  const result = await sendSessionMediaAndTextOrder(order, config, requestOrigin);
  return {
    success: result.success,
    orderId: order.orderId,
    error: result.error,
  };
}
