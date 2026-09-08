"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  X,
  ArrowLeft,
  ArrowRight,
  User,
  Gift,
  Phone,
  MapPin,
  FileText,
  CheckCircle2,
  Edit3,
  ShoppingBag,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CreditCard,
  Banknote,
  QrCode,
  Info,
} from "lucide-react";
import { CartEntry } from "./CartDrawer";
import {
  CustomerDetails,
  INDIAN_STATES,
  OrderType,
  PaymentMethod,
  getWhatsAppOrderUrl,
  BUSINESS_WHATSAPP_NUMBER,
  formatCategoryName,
} from "@/utils/whatsapp";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartEntry[];
  onUpdateQty?: (productId: string, delta: number) => void;
  onRemoveItem?: (productId: string) => void;
  onBackToCart?: () => void;
  onClearCart?: () => void;
}

type CheckoutStep = "form" | "review" | "confirmation";

// Custom WhatsApp SVG Icon
function WhatsAppIcon({ className = "w-5 h-5 fill-current" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function CheckoutModal({
  isOpen,
  onClose,
  items,
  onUpdateQty,
  onRemoveItem,
  onBackToCart,
  onClearCart,
}: CheckoutModalProps) {
  const [step, setStep] = useState<CheckoutStep>("form");

  // Form State
  const [formData, setFormData] = useState<CustomerDetails>({
    fullName: "",
    mobile: "",
    address: "",
    city: "",
    state: "Andhra Pradesh",
    pincode: "",
    instructions: "",
    orderType: "myself",
    paymentMethod: "cod",
    paymentReference: "",
  });

  // Validation Errors
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerDetails, string>>>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Confirmed Order Details
  const [confirmedOrderId, setConfirmedOrderId] = useState<string>("");
  const [confirmedTotal, setConfirmedTotal] = useState<number>(0);
  const [confirmedItemCount, setConfirmedItemCount] = useState<number>(0);
  const [confirmedWhatsappUrl, setConfirmedWhatsappUrl] = useState<string>("");

  if (!isOpen) return null;

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // Handle Form Change with Live Validation
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Mobile number formatting: digits only, max 10
    if (name === "mobile") {
      formattedValue = value.replace(/\D/g, "").slice(0, 10);
    }

    // Pincode formatting: digits only, max 6
    if (name === "pincode") {
      formattedValue = value.replace(/\D/g, "").slice(0, 6);
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));

    if (hasAttemptedSubmit) {
      validateField(name as keyof CustomerDetails, formattedValue, formData.paymentMethod);
    }
  };

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setFormData((prev) => ({ ...prev, paymentMethod: method }));
    if (hasAttemptedSubmit) {
      if (method === "cod") {
        setErrors((prev) => ({ ...prev, paymentReference: undefined }));
      } else {
        validateField("paymentReference", formData.paymentReference || "", "online");
      }
    }
  };

  const validateField = (
    field: keyof CustomerDetails,
    value: string,
    currentPaymentMethod: PaymentMethod = formData.paymentMethod
  ) => {
    let error = "";
    switch (field) {
      case "fullName":
        if (!value.trim()) {
          error = "Please enter your full name.";
        } else if (value.trim().length < 2) {
          error = "Full name must be at least 2 characters.";
        }
        break;
      case "mobile":
        if (!value.trim()) {
          error = "Please enter your mobile number.";
        } else if (!/^[6-9]\d{9}$/.test(value.trim())) {
          error = "Please enter a valid 10-digit mobile number starting with 6-9.";
        }
        break;
      case "address":
        if (!value.trim()) {
          error = "Please enter your complete delivery address.";
        } else if (value.trim().length < 5) {
          error = "Please enter a detailed street/building address.";
        }
        break;
      case "city":
        if (!value.trim()) {
          error = "Please enter your city.";
        }
        break;
      case "state":
        if (!value.trim()) {
          error = "Please select your state.";
        }
        break;
      case "pincode":
        if (!value.trim()) {
          error = "Please enter your pincode.";
        } else if (!/^\d{6}$/.test(value.trim())) {
          error = "Please enter a valid 6-digit postal pincode.";
        }
        break;
      case "paymentReference":
        if (currentPaymentMethod === "online") {
          if (!value.trim()) {
            error = "Please enter your Payment Reference / UTR number.";
          } else if (value.trim().length < 4) {
            error = "Please enter a valid Payment Reference / UTR number (min 4 characters).";
          }
        }
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    return error;
  };

  const validateAll = (): boolean => {
    const newErrors: Partial<Record<keyof CustomerDetails, string>> = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      newErrors.fullName = "Please enter your full name.";
    }
    if (!formData.mobile.trim() || !/^[6-9]\d{9}$/.test(formData.mobile.trim())) {
      newErrors.mobile = "Please enter a valid 10-digit mobile number.";
    }
    if (!formData.address.trim() || formData.address.trim().length < 5) {
      newErrors.address = "Please enter your complete delivery address.";
    }
    if (!formData.city.trim()) {
      newErrors.city = "Please enter your city.";
    }
    if (!formData.state.trim()) {
      newErrors.state = "Please select your state.";
    }
    if (!formData.pincode.trim() || !/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = "Please enter a valid 6-digit postal pincode.";
    }
    if (formData.paymentMethod === "online") {
      if (!formData.paymentReference || !formData.paymentReference.trim() || formData.paymentReference.trim().length < 4) {
        newErrors.paymentReference = "Please enter your Payment Reference / UTR number.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);
    setSubmitError(null);
    if (validateAll()) {
      setStep("review");
    }
  };

  // Place Order: Validates on server, generates Order ID and prefilled WhatsApp URL, opens WhatsApp
  const handleConfirmOrder = async () => {
    if (items.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/checkout/whatsapp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer: formData,
          items: items.map((it) => ({
            productId: it.product.id,
            quantity: it.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setConfirmedOrderId(data.orderId);
        setConfirmedTotal(data.totalAmount || totalAmount);
        setConfirmedItemCount(data.totalItems || totalItems);
        setConfirmedWhatsappUrl(data.whatsappUrl);

        // Open WhatsApp directly with pre-filled message
        if (typeof window !== "undefined" && data.whatsappUrl) {
          window.open(data.whatsappUrl, "_blank", "noopener,noreferrer");
        }

        // Advance to confirmation screen
        setStep("confirmation");

        // Clear cart after verified order creation
        if (onClearCart) {
          onClearCart();
        }
      } else {
        const errorMsg = data?.error || "We couldn't process your order right now. Please check your details and try again.";
        setSubmitError(errorMsg);
      }
    } catch (err) {
      console.error("Checkout request error:", err);
      setSubmitError("We couldn't connect to complete your order. Please check your internet connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setStep("form");
    setHasAttemptedSubmit(false);
    setErrors({});
    setSubmitError(null);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-[#FAF7F3] rounded-2xl sm:rounded-3xl border border-[#C5A47E]/40 shadow-2xl overflow-hidden text-[#231610]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="px-5 sm:px-7 py-4 border-b border-[#EAE2D8] bg-[#F5ECE5]/60 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            {step === "review" && (
              <button
                type="button"
                onClick={() => {
                  setSubmitError(null);
                  setStep("form");
                }}
                disabled={isSubmitting}
                className="w-8 h-8 rounded-full bg-white hover:bg-[#231610] text-[#231610] hover:text-white border border-[#EAE2D8] flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
                aria-label="Back to form"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] text-[#BA7442] uppercase">
                  INSHA COLLECTIONS
                </span>
                <span className="text-[#C5A47E] text-[8px]">◆</span>
                <span className="text-[10px] sm:text-xs text-[#7A6F68]">
                  WhatsApp Checkout
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-normal text-[#231610] font-serif-luxury tracking-wider uppercase mt-0.5">
                {step === "form" && "CUSTOMER DETAILS & PAYMENT"}
                {step === "review" && "ORDER REVIEW & CONFIRMATION"}
                {step === "confirmation" && "ORDER READY FOR WHATSAPP"}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-full bg-white text-[#231610] hover:bg-[#231610] hover:text-white border border-[#EAE2D8] flex items-center justify-center transition-colors focus:outline-none cursor-pointer"
            aria-label="Close checkout"
          >
            <X className="w-4 h-4 stroke-[1.5]" />
          </button>
        </div>

        {/* Empty Cart Guard */}
        {items.length === 0 && step !== "confirmation" ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#EAE2D8]/60 flex items-center justify-center text-[#BA7442]">
              <ShoppingBag className="w-8 h-8 stroke-[1.3]" />
            </div>
            <h3 className="text-lg font-normal text-[#231610] font-serif-luxury tracking-wider uppercase">
              YOUR CART IS EMPTY
            </h3>
            <p className="text-xs sm:text-sm text-[#7A6F68] max-w-sm">
              Please add items from our luxury collection to proceed with WhatsApp checkout.
            </p>
            <button
              type="button"
              onClick={handleResetAndClose}
              className="mt-2 px-6 py-3 rounded-xl bg-[#231610] hover:bg-[#BA7442] text-[#FAF7F3] text-xs font-semibold tracking-widest uppercase transition-colors cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 sm:p-7 md:p-8">
            {/* ========================================================================= */}
            {/* STEP 1: CHECKOUT FORM (CUSTOMER DETAILS & PAYMENT METHOD)                 */}
            {/* ========================================================================= */}
            {step === "form" && (
              <form onSubmit={handleFormSubmit} className="space-y-6" noValidate>
                {/* Section Header: Customer Details */}
                <div className="space-y-1 border-b border-[#EAE2D8] pb-2">
                  <span className="text-[11px] font-semibold text-[#BA7442] tracking-wider uppercase">
                    STEP 1 OF 2
                  </span>
                  <h3 className="text-sm sm:text-base font-normal text-[#231610] font-serif-luxury tracking-wide uppercase">
                    Delivery & Customer Information
                  </h3>
                </div>

                {/* ========================================================================= */}
                {/* ORDER TYPE SELECTION                                                     */}
                {/* ========================================================================= */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#BA7442] tracking-wider uppercase">
                    ORDER TYPE <span className="text-[#BA7442]">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* For Myself */}
                    <label
                      onClick={() => setFormData((prev) => ({ ...prev, orderType: "myself" }))}
                      className={`relative flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        formData.orderType === "myself"
                          ? "border-[#BA7442] bg-white shadow-sm ring-1 ring-[#BA7442]/30"
                          : "border-[#EAE2D8] bg-white/70 hover:border-[#D5C2AF] hover:bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="orderType"
                        value="myself"
                        checked={formData.orderType === "myself"}
                        onChange={() => setFormData((prev) => ({ ...prev, orderType: "myself" }))}
                        className="w-4 h-4 text-[#BA7442] focus:ring-[#BA7442] accent-[#BA7442] cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-[#BA7442]" />
                          <span className="text-xs sm:text-sm font-semibold text-[#231610]">
                            For Myself
                          </span>
                        </div>
                        <p className="text-[11px] text-[#7A6F68] mt-0.5">
                          I am ordering for my own use
                        </p>
                      </div>
                    </label>

                    {/* For Gift */}
                    <label
                      onClick={() => setFormData((prev) => ({ ...prev, orderType: "gift" }))}
                      className={`relative flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        formData.orderType === "gift"
                          ? "border-[#BA7442] bg-white shadow-sm ring-1 ring-[#BA7442]/30"
                          : "border-[#EAE2D8] bg-white/70 hover:border-[#D5C2AF] hover:bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="orderType"
                        value="gift"
                        checked={formData.orderType === "gift"}
                        onChange={() => setFormData((prev) => ({ ...prev, orderType: "gift" }))}
                        className="w-4 h-4 text-[#BA7442] focus:ring-[#BA7442] accent-[#BA7442] cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Gift className="w-4 h-4 text-[#BA7442]" />
                          <span className="text-xs sm:text-sm font-semibold text-[#231610]">
                            For Gift
                          </span>
                        </div>
                        <p className="text-[11px] text-[#7A6F68] mt-0.5">
                          I am ordering this as a gift
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Form Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="fullName"
                      className="block text-xs font-medium text-[#231610] tracking-wide mb-1.5"
                    >
                      Full Name <span className="text-[#BA7442]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        autoComplete="name"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="e.g. Sameer Khan"
                        className={`w-full px-4 py-3 text-xs sm:text-sm rounded-xl bg-white border ${
                          errors.fullName ? "border-[#C53030] ring-1 ring-[#C53030]" : "border-[#D5C2AF]"
                        } text-[#231610] placeholder-[#A09388] focus:outline-none focus:border-[#BA7442] focus:ring-1 focus:ring-[#BA7442] transition-colors`}
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-[11px] text-[#C53030] mt-1 font-medium">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Mobile Number */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="mobile"
                      className="block text-xs font-medium text-[#231610] tracking-wide mb-1.5"
                    >
                      Mobile Number <span className="text-[#BA7442]">*</span>
                      <span className="text-[11px] text-[#7A6F68] font-normal ml-1">
                        (WhatsApp mobile number for confirmation)
                      </span>
                    </label>
                    <div className="flex items-stretch rounded-xl overflow-hidden border border-[#D5C2AF] bg-white focus-within:border-[#BA7442] focus-within:ring-1 focus-within:ring-[#BA7442]">
                      <span className="px-3.5 flex items-center bg-[#F5ECE5] text-xs font-semibold text-[#5A4D45] border-r border-[#D5C2AF] select-none">
                        +91
                      </span>
                      <input
                        id="mobile"
                        name="mobile"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel-national"
                        maxLength={10}
                        value={formData.mobile}
                        onChange={handleChange}
                        placeholder="9618648050"
                        className="flex-1 px-4 py-3 text-xs sm:text-sm bg-white text-[#231610] placeholder-[#A09388] focus:outline-none"
                      />
                    </div>
                    {errors.mobile && (
                      <p className="text-[11px] text-[#C53030] mt-1 font-medium">
                        {errors.mobile}
                      </p>
                    )}
                  </div>

                  {/* Complete Delivery Address */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="address"
                      className="block text-xs font-medium text-[#231610] tracking-wide mb-1.5"
                    >
                      Complete Delivery Address <span className="text-[#BA7442]">*</span>
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      rows={2}
                      autoComplete="street-address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Door No, Street Name, Landmark, Area"
                      className={`w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-white border ${
                        errors.address ? "border-[#C53030] ring-1 ring-[#C53030]" : "border-[#D5C2AF]"
                      } text-[#231610] placeholder-[#A09388] focus:outline-none focus:border-[#BA7442] focus:ring-1 focus:ring-[#BA7442] transition-colors resize-none`}
                    />
                    {errors.address && (
                      <p className="text-[11px] text-[#C53030] mt-1 font-medium">
                        {errors.address}
                      </p>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <label
                      htmlFor="city"
                      className="block text-xs font-medium text-[#231610] tracking-wide mb-1.5"
                    >
                      City <span className="text-[#BA7442]">*</span>
                    </label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      autoComplete="address-level2"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g. Kadapa"
                      className={`w-full px-4 py-3 text-xs sm:text-sm rounded-xl bg-white border ${
                        errors.city ? "border-[#C53030] ring-1 ring-[#C53030]" : "border-[#D5C2AF]"
                      } text-[#231610] placeholder-[#A09388] focus:outline-none focus:border-[#BA7442] focus:ring-1 focus:ring-[#BA7442] transition-colors`}
                    />
                    {errors.city && (
                      <p className="text-[11px] text-[#C53030] mt-1 font-medium">
                        {errors.city}
                      </p>
                    )}
                  </div>

                  {/* State */}
                  <div>
                    <label
                      htmlFor="state"
                      className="block text-xs font-medium text-[#231610] tracking-wide mb-1.5"
                    >
                      State <span className="text-[#BA7442]">*</span>
                    </label>
                    <select
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 text-xs sm:text-sm rounded-xl bg-white border ${
                        errors.state ? "border-[#C53030] ring-1 ring-[#C53030]" : "border-[#D5C2AF]"
                      } text-[#231610] focus:outline-none focus:border-[#BA7442] focus:ring-1 focus:ring-[#BA7442] transition-colors cursor-pointer`}
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                    {errors.state && (
                      <p className="text-[11px] text-[#C53030] mt-1 font-medium">
                        {errors.state}
                      </p>
                    )}
                  </div>

                  {/* Pincode */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="pincode"
                      className="block text-xs font-medium text-[#231610] tracking-wide mb-1.5"
                    >
                      Pincode <span className="text-[#BA7442]">*</span>
                    </label>
                    <input
                      id="pincode"
                      name="pincode"
                      type="text"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      maxLength={6}
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="e.g. 516001"
                      className={`w-full px-4 py-3 text-xs sm:text-sm rounded-xl bg-white border ${
                        errors.pincode ? "border-[#C53030] ring-1 ring-[#C53030]" : "border-[#D5C2AF]"
                      } text-[#231610] placeholder-[#A09388] focus:outline-none focus:border-[#BA7442] focus:ring-1 focus:ring-[#BA7442] transition-colors`}
                    />
                    {errors.pincode && (
                      <p className="text-[11px] text-[#C53030] mt-1 font-medium">
                        {errors.pincode}
                      </p>
                    )}
                  </div>

                  {/* Delivery Instructions (Optional) */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="instructions"
                      className="block text-xs font-medium text-[#231610] tracking-wide mb-1.5"
                    >
                      Delivery Instructions <span className="text-[#7A6F68] font-normal">(Optional)</span>
                    </label>
                    <textarea
                      id="instructions"
                      name="instructions"
                      rows={2}
                      value={formData.instructions}
                      onChange={handleChange}
                      placeholder="e.g. Please deliver between 2 PM to 5 PM."
                      className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl bg-white border border-[#D5C2AF] text-[#231610] placeholder-[#A09388] focus:outline-none focus:border-[#BA7442] focus:ring-1 focus:ring-[#BA7442] transition-colors resize-none"
                    />
                  </div>
                </div>

                {/* ========================================================================= */}
                {/* PAYMENT METHOD SELECTION                                                 */}
                {/* ========================================================================= */}
                <div className="pt-2 space-y-4">
                  <div className="space-y-1 border-b border-[#EAE2D8] pb-2">
                    <span className="text-[11px] font-semibold text-[#BA7442] tracking-wider uppercase">
                      PAYMENT METHOD <span className="text-[#BA7442]">*</span>
                    </span>
                    <h3 className="text-sm sm:text-base font-normal text-[#231610] font-serif-luxury tracking-wide uppercase">
                      Select Payment Mode
                    </h3>
                  </div>

                  {/* Payment Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Cash on Delivery */}
                    <label
                      onClick={() => handlePaymentMethodChange("cod")}
                      className={`relative flex items-center gap-3.5 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        formData.paymentMethod === "cod"
                          ? "border-[#BA7442] bg-white shadow-sm ring-1 ring-[#BA7442]/30"
                          : "border-[#EAE2D8] bg-white/70 hover:border-[#D5C2AF] hover:bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={formData.paymentMethod === "cod"}
                        onChange={() => handlePaymentMethodChange("cod")}
                        className="w-4 h-4 text-[#BA7442] focus:ring-[#BA7442] accent-[#BA7442] cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Banknote className="w-4 h-4 text-[#BA7442]" />
                          <span className="text-xs sm:text-sm font-semibold text-[#231610]">
                            Cash on Delivery
                          </span>
                        </div>
                        <p className="text-[11px] text-[#7A6F68] mt-0.5">
                          Pay directly upon delivery
                        </p>
                      </div>
                    </label>

                    {/* Online Payment */}
                    <label
                      onClick={() => handlePaymentMethodChange("online")}
                      className={`relative flex items-center gap-3.5 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        formData.paymentMethod === "online"
                          ? "border-[#BA7442] bg-white shadow-sm ring-1 ring-[#BA7442]/30"
                          : "border-[#EAE2D8] bg-white/70 hover:border-[#D5C2AF] hover:bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="online"
                        checked={formData.paymentMethod === "online"}
                        onChange={() => handlePaymentMethodChange("online")}
                        className="w-4 h-4 text-[#BA7442] focus:ring-[#BA7442] accent-[#BA7442] cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <QrCode className="w-4 h-4 text-[#BA7442]" />
                          <span className="text-xs sm:text-sm font-semibold text-[#231610]">
                            Online Payment
                          </span>
                        </div>
                        <p className="text-[11px] text-[#7A6F68] mt-0.5">
                          Scan & Pay using PhonePe QR
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Online Payment Section with PhonePe QR */}
                  {formData.paymentMethod === "online" && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#BA7442]/40 shadow-xs space-y-4 animate-in fade-in zoom-in-98 duration-200">
                      <div className="text-center space-y-1 border-b border-[#F5ECE5] pb-3">
                        <span className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] text-[#BA7442] uppercase">
                          ONLINE PAYMENT
                        </span>
                        <h4 className="text-sm sm:text-base font-normal text-[#231610] font-serif-luxury tracking-wide uppercase">
                          Scan & Pay using PhonePe
                        </h4>
                      </div>

                      {/* PhonePe QR Display */}
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="relative w-56 sm:w-64 aspect-[1/2] rounded-xl overflow-hidden border border-[#EAE2D8] shadow-md bg-white p-1">
                          <Image
                            src="/images/payment/phonepe-qr.png"
                            alt="Scan & Pay using PhonePe QR Code"
                            fill
                            priority
                            sizes="(max-width: 640px) 224px, 256px"
                            className="object-contain"
                          />
                        </div>

                        <div className="flex items-center gap-2 text-xs text-[#5A4D45] bg-[#F5ECE5] px-3.5 py-2 rounded-xl text-center">
                          <Info className="w-4 h-4 text-[#BA7442] flex-shrink-0" />
                          <span>Please complete the payment before placing the order.</span>
                        </div>
                      </div>

                      {/* Payment Reference / UTR Input Field */}
                      <div className="pt-2">
                        <label
                          htmlFor="paymentReference"
                          className="block text-xs font-medium text-[#231610] tracking-wide mb-1.5"
                        >
                          Payment Reference / UTR Number <span className="text-[#BA7442]">*</span>
                        </label>
                        <input
                          id="paymentReference"
                          name="paymentReference"
                          type="text"
                          value={formData.paymentReference || ""}
                          onChange={handleChange}
                          placeholder="Enter payment reference / UTR number"
                          className={`w-full px-4 py-3 text-xs sm:text-sm rounded-xl bg-white border ${
                            errors.paymentReference
                              ? "border-[#C53030] ring-1 ring-[#C53030]"
                              : "border-[#D5C2AF]"
                          } text-[#231610] placeholder-[#A09388] focus:outline-none focus:border-[#BA7442] focus:ring-1 focus:ring-[#BA7442] transition-colors`}
                        />
                        {errors.paymentReference && (
                          <p className="text-[11px] text-[#C53030] mt-1 font-medium">
                            {errors.paymentReference}
                          </p>
                        )}
                        <p className="text-[11px] text-[#7A6F68] mt-1">
                          Enter the 12-digit UTR number or UPI transaction reference from PhonePe.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mini Order Summary Strip */}
                <div className="p-3.5 rounded-xl bg-[#F5ECE5] border border-[#EAE2D8] flex items-center justify-between text-xs text-[#5A4D45]">
                  <span>
                    Cart Items: <strong className="text-[#231610]">{totalItems}</strong>
                  </span>
                  <span>
                    Total Amount: <strong className="text-[#231610] text-sm">₹{totalAmount.toLocaleString("en-IN")}</strong>
                  </span>
                </div>

                {/* Form Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  {onBackToCart && (
                    <button
                      type="button"
                      onClick={onBackToCart}
                      className="w-full sm:w-auto px-5 py-3 rounded-xl border border-[#D5C2AF] hover:border-[#231610] text-[#231610] text-xs font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Cart</span>
                    </button>
                  )}

                  <button
                    type="submit"
                    className="flex-1 py-3.5 px-6 rounded-xl bg-[#231610] hover:bg-[#BA7442] text-[#FAF7F3] text-xs sm:text-sm font-semibold tracking-widest uppercase transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Review Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* ========================================================================= */}
            {/* STEP 2: ORDER PREVIEW / REVIEW                                            */}
            {/* ========================================================================= */}
            {step === "review" && (
              <div className="space-y-5">
                {/* Submission Error Banner */}
                {submitError && (
                  <div className="p-4 rounded-2xl bg-[#FFF5F5] border border-[#FEB2B2] text-[#9B2C2C] text-xs flex items-start gap-3 animate-in fade-in duration-200">
                    <AlertCircle className="w-5 h-5 text-[#C53030] flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-[#822727] text-sm">Order Submission Alert</p>
                      <p className="mt-0.5 leading-relaxed">{submitError}</p>
                    </div>
                  </div>
                )}

                {/* 1. ORDER FROM WEBSITE / ORDER TYPE CARD */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EAE2D8] shadow-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-[#F2ECE4] pb-2.5">
                    <div>
                      <span className="text-[10px] font-semibold tracking-[0.16em] text-[#BA7442] uppercase block">
                        ORDER FROM WEBSITE
                      </span>
                      <h3 className="text-sm sm:text-base font-normal text-[#231610] font-serif-luxury tracking-wide uppercase mt-0.5">
                        Order Summary & Review
                      </h3>
                    </div>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => {
                        setSubmitError(null);
                        setStep("form");
                      }}
                      className="inline-flex items-center gap-1 text-xs text-[#BA7442] hover:text-[#231610] font-medium transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2.5 pt-1 text-xs sm:text-[13px] text-[#231610]">
                    {formData.orderType === "gift" ? (
                      <Gift className="w-4 h-4 text-[#BA7442] flex-shrink-0" />
                    ) : (
                      <User className="w-4 h-4 text-[#BA7442] flex-shrink-0" />
                    )}
                    <span>
                      Order Type:{" "}
                      <strong className="text-[#231610]">
                        {formData.orderType === "gift" ? "For Gift" : "For Myself"}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* 2. Customer Details Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EAE2D8] shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-[#F2ECE4] pb-2.5">
                    <h3 className="text-xs font-semibold tracking-[0.14em] text-[#BA7442] uppercase font-serif-luxury">
                      CUSTOMER DETAILS
                    </h3>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => {
                        setSubmitError(null);
                        setStep("form");
                      }}
                      className="inline-flex items-center gap-1 text-xs text-[#BA7442] hover:text-[#231610] font-medium transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  </div>

                  <div className="space-y-2 text-xs sm:text-[13px] text-[#231610]">
                    <div className="flex items-center gap-2.5">
                      <User className="w-4 h-4 text-[#BA7442] flex-shrink-0" />
                      <span className="font-medium">{formData.fullName}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-[#BA7442] flex-shrink-0" />
                      <span>+91 {formData.mobile}</span>
                    </div>
                    <div className="flex items-start gap-2.5 pt-1">
                      <MapPin className="w-4 h-4 text-[#BA7442] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="leading-relaxed">{formData.address}</p>
                        <p className="text-[#5A4D45] mt-0.5">
                          {formData.city}, {formData.state} – <span className="font-medium">{formData.pincode}</span>
                        </p>
                      </div>
                    </div>

                    {formData.instructions && formData.instructions.trim() && (
                      <div className="mt-2 pt-2 border-t border-[#F5ECE5] text-[#7A6F68] text-[12px] flex items-start gap-2">
                        <FileText className="w-3.5 h-3.5 text-[#BA7442] flex-shrink-0 mt-0.5" />
                        <p>
                          <strong className="text-[#3D312A]">Instructions:</strong> {formData.instructions}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Payment Details Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EAE2D8] shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-[#F2ECE4] pb-2.5">
                    <h3 className="text-xs font-semibold tracking-[0.14em] text-[#BA7442] uppercase font-serif-luxury">
                      PAYMENT DETAILS
                    </h3>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => {
                        setSubmitError(null);
                        setStep("form");
                      }}
                      className="inline-flex items-center gap-1 text-xs text-[#BA7442] hover:text-[#231610] font-medium transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  </div>

                  <div className="space-y-2 text-xs sm:text-[13px] text-[#231610]">
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-4 h-4 text-[#BA7442] flex-shrink-0" />
                      <span>
                        Payment Method:{" "}
                        <strong className="text-[#231610]">
                          {formData.paymentMethod === "online" ? "Online Payment (PhonePe)" : "Cash on Delivery"}
                        </strong>
                      </span>
                    </div>

                    {formData.paymentMethod === "online" && (
                      <div className="flex items-center gap-2.5 pl-6 text-xs text-[#5A4D45]">
                        <span>Payment Reference / UTR:</span>
                        <span className="font-mono font-semibold text-[#231610] bg-[#F5ECE5] px-2 py-0.5 rounded">
                          {formData.paymentReference}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Products Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EAE2D8] shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-[#F2ECE4] pb-2.5">
                    <h3 className="text-xs font-semibold tracking-[0.14em] text-[#BA7442] uppercase font-serif-luxury">
                      PRODUCTS ({totalItems} {totalItems === 1 ? "Item" : "Items"})
                    </h3>
                    {onBackToCart && (
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={onBackToCart}
                        className="inline-flex items-center gap-1 text-xs text-[#BA7442] hover:text-[#231610] font-medium transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Cart</span>
                      </button>
                    )}
                  </div>

                  {/* Items List with complete product information */}
                  <div className="divide-y divide-[#F5ECE5] space-y-3">
                    {items.map(({ product, quantity }) => {
                      const itemSubtotal = product.price * quantity;
                      const catDisplay = formatCategoryName(product.category);
                      const subCatDisplay = product.subCategory || catDisplay;

                      return (
                        <div
                          key={product.id}
                          className="pt-3 first:pt-0 space-y-2"
                        >
                          <div className="flex items-start gap-3.5">
                            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#F5ECE5] overflow-hidden flex-shrink-0 border border-[#EAE2D8]">
                              <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                sizes="80px"
                                className="object-cover object-center"
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs sm:text-sm font-medium text-[#231610] font-serif-luxury truncate">
                                {product.name}
                              </h4>
                              <p className="text-[10px] sm:text-[11px] font-mono text-[#7A6F68] mt-0.5">
                                ID: {product.id} • {catDisplay} {subCatDisplay !== catDisplay ? `(${subCatDisplay})` : ""}
                              </p>

                              {product.description && (
                                <p className="text-[11px] text-[#6B5E55] line-clamp-2 mt-1 leading-relaxed">
                                  {product.description}
                                </p>
                              )}

                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <p className="text-[11px] text-[#7A6F68]">
                                  Price: ₹{product.price.toLocaleString("en-IN")}
                                </p>
                                {onUpdateQty && !isSubmitting ? (
                                  <div className="inline-flex items-center border border-[#D5C2AF] rounded-md bg-[#FAF7F3] text-[11px]">
                                    <button
                                      type="button"
                                      onClick={() => onUpdateQty(product.id, -1)}
                                      className="px-1.5 py-0.5 hover:bg-white text-[#231610] transition-colors cursor-pointer font-bold"
                                      aria-label="Decrease quantity"
                                    >
                                      -
                                    </button>
                                    <span className="px-1.5 py-0.5 font-semibold text-[11px] text-[#231610] min-w-[16px] text-center">
                                      {quantity}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => onUpdateQty(product.id, 1)}
                                      className="px-1.5 py-0.5 hover:bg-white text-[#231610] transition-colors cursor-pointer font-bold"
                                      aria-label="Increase quantity"
                                    >
                                      +
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[11px] font-semibold text-[#231610]">Qty: {quantity}</span>
                                )}
                                {onRemoveItem && !isSubmitting && (
                                  <button
                                    type="button"
                                    onClick={() => onRemoveItem(product.id)}
                                    className="text-[#9E9085] hover:text-[#C53030] p-0.5 transition-colors cursor-pointer ml-1"
                                    aria-label="Remove item"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="text-right flex-shrink-0">
                              <span className="text-xs sm:text-sm font-bold text-[#231610]">
                                ₹{itemSubtotal.toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 5. ORDER SUMMARY */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#F5ECE5]/80 border border-[#EAE2D8] space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between text-[#5A4D45]">
                    <span>Total Items</span>
                    <span className="font-semibold text-[#231610]">{totalItems}</span>
                  </div>
                  <div className="flex justify-between text-[#5A4D45]">
                    <span>Subtotal</span>
                    <span className="font-semibold text-[#231610]">₹{totalAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-[#5A4D45]">
                    <span>Shipping</span>
                    <span className="font-semibold text-[#15803D]">FREE (₹0)</span>
                  </div>
                  <div className="flex justify-between text-[#5A4D45]">
                    <span>Discount</span>
                    <span className="font-semibold text-[#231610]">₹0</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base font-bold text-[#231610] pt-2 border-t border-[#D5C2AF]">
                    <span className="tracking-wide uppercase font-serif-luxury">TOTAL</span>
                    <span className="text-[#BA7442]">₹{totalAmount.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {/* Destination Notice */}
                <div className="p-3 rounded-xl bg-[#F9F4EE] border border-[#E4D7C8] flex items-center gap-2.5 text-[11px] text-[#6B5E55]">
                  <ShieldCheck className="w-4 h-4 text-[#BA7442] flex-shrink-0" />
                  <span>
                    When you click PLACE ORDER, your order will open in WhatsApp with Insha Collections (+91 9618648050) so you can press send.
                  </span>
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      setSubmitError(null);
                      setStep("form");
                    }}
                    className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-[#D5C2AF] hover:border-[#231610] text-[#231610] text-xs font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Edit Details</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleConfirmOrder}
                    className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#BA7442] via-[#9C5A2C] to-[#80421B] hover:from-[#A86435] hover:to-[#733B18] text-white text-xs sm:text-sm font-semibold tracking-widest uppercase transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>PREPARING ORDER...</span>
                      </>
                    ) : (
                      <>
                        <WhatsAppIcon className="w-5 h-5 fill-white" />
                        <span>PLACE ORDER</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STEP 3: ORDER REQUEST SENT CONFIRMATION                                    */}
            {/* ========================================================================= */}
            {step === "confirmation" && (
              <div className="py-6 sm:py-8 flex flex-col items-center text-center space-y-5 animate-in zoom-in-95 duration-300">
                {/* Gold Checkmark Badge */}
                <div className="relative">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#BA7442] to-[#80421B] flex items-center justify-center text-white shadow-xl">
                    <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2]" />
                  </div>
                  <div className="absolute -top-1 -right-1 text-[#BA7442] animate-bounce">
                    <Sparkles className="w-5 h-5" />
                  </div>
                </div>

                {/* Headings */}
                <div className="space-y-1.5 max-w-md">
                  <span className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] text-[#BA7442] uppercase">
                    ORDER PREPARED FOR WHATSAPP
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-normal text-[#231610] font-serif-luxury tracking-wide">
                    Thank You!
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5A4D45] font-medium leading-relaxed">
                    Your order details and product images have been generated for Insha Collections.
                  </p>
                </div>

                {/* Delicate Divider */}
                <div className="flex items-center gap-2">
                  <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#BA7442]" />
                  <span className="text-[#BA7442] text-[9px]">◆</span>
                  <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#BA7442]" />
                </div>

                {/* Order Reference Box */}
                {confirmedOrderId && (
                  <div className="w-full max-w-md p-4 rounded-2xl bg-white border border-[#BA7442]/30 shadow-xs flex items-center justify-between text-left">
                    <div>
                      <span className="text-[10px] font-semibold text-[#7A6F68] uppercase tracking-wider block">
                        ORDER ID
                      </span>
                      <span className="text-sm sm:text-base font-bold text-[#231610] font-mono tracking-wide">
                        {confirmedOrderId}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#7A6F68] uppercase tracking-wider block">
                        TOTAL AMOUNT
                      </span>
                      <span className="text-sm sm:text-base font-bold text-[#BA7442]">
                        ₹{confirmedTotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                )}

                {/* WhatsApp Status Box */}
                <div className="w-full max-w-md p-4 sm:p-5 rounded-2xl bg-[#F5ECE5] border border-[#EAE2D8] text-xs text-[#3D312A] space-y-2.5 text-left">
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-[#25D366]/20 text-[#128C7E] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <WhatsAppIcon className="w-3.5 h-3.5 fill-[#128C7E]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#231610]">
                        WhatsApp Pre-filled Order
                      </p>
                      <p className="text-[11.5px] text-[#6B5E55] mt-0.5 leading-relaxed">
                        WhatsApp has been opened with your complete order message. Please press <strong>SEND</strong> in WhatsApp to deliver the order to Insha Collections on <strong>+91 9618648050</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E0D0BE] flex items-center justify-between text-[11px] text-[#5A4D45]">
                    <span>Order Type: <strong className="text-[#231610]">{formData.orderType === "gift" ? "For Gift" : "For Myself"}</strong></span>
                    <span>Payment: <strong className="text-[#BA7442]">{formData.paymentMethod === "online" ? "Online Payment" : "COD"}</strong></span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="w-full max-w-md pt-2 space-y-2.5">
                  {confirmedWhatsappUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== "undefined") {
                          window.open(confirmedWhatsappUrl, "_blank", "noopener,noreferrer");
                        }
                      }}
                      className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#20BA5C] hover:to-[#0F7569] text-white text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg"
                    >
                      <WhatsAppIcon className="w-4 h-4 fill-white" />
                      <span>OPEN IN WHATSAPP TO SEND</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleResetAndClose}
                    className="w-full py-3.5 px-6 rounded-xl bg-[#231610] hover:bg-[#BA7442] text-[#FAF7F3] text-xs sm:text-sm font-semibold tracking-widest uppercase transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>CONTINUE SHOPPING</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
