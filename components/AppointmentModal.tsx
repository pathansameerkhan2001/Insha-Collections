"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  X,
  Calendar,
  Clock,
  User,
  Gift,
  Phone,
  Sparkles,
  CheckCircle2,
  Star,
  QrCode,
  Banknote,
  Info,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { ServiceItem } from "@/data/catalog";
import {
  AppointmentBookingType,
  AppointmentPaymentMethod,
  AppointmentPayload,
  generateAppointmentReference,
  formatWhatsAppAppointmentMessage,
  BUSINESS_WHATSAPP_NUMBER,
} from "@/utils/whatsapp";

interface AppointmentModalProps {
  service: ServiceItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const TIME_SLOTS = [
  "10:00 AM",
  "11:30 AM",
  "01:00 PM",
  "02:30 PM",
  "04:00 PM",
  "05:30 PM",
  "07:00 PM",
];

// Custom WhatsApp SVG Icon
function WhatsAppIcon({ className = "w-5 h-5 fill-current" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/**
 * Format a YYYY-MM-DD input date into MM/DD/YYYY format.
 */
function formatDateToDisplay(isoDate: string): string {
  if (!isoDate) return "";
  const parts = isoDate.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${month}/${day}/${year}`;
  }
  return isoDate;
}

export default function AppointmentModal({
  service,
  isOpen,
  onClose,
}: AppointmentModalProps) {
  // Form State
  const [selectedDate, setSelectedDate] = useState("2026-09-05");
  const [selectedTime, setSelectedTime] = useState("11:30 AM");
  const [bookingType, setBookingType] = useState<AppointmentBookingType>("myself");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<AppointmentPaymentMethod>("salon");
  const [paymentReference, setPaymentReference] = useState("");

  // Validation State
  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
    date?: string;
    time?: string;
    paymentReference?: string;
  }>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Confirmed State
  const [isBooked, setIsBooked] = useState(false);
  const [confirmedAppointmentId, setConfirmedAppointmentId] = useState("");
  const [confirmedWhatsappUrl, setConfirmedWhatsappUrl] = useState("");
  const [copiedId, setCopiedId] = useState(false);

  if (!isOpen || !service) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const digitsOnly = rawVal.replace(/\D/g, "").slice(0, 10);
    setPhone(digitsOnly);
    if (hasAttemptedSubmit) {
      validatePhone(digitsOnly);
    }
  };

  const validatePhone = (value: string): boolean => {
    if (!value.trim()) {
      setErrors((prev) => ({ ...prev, phone: "Please enter your mobile number." }));
      return false;
    }
    if (!/^[6-9]\d{9}$/.test(value.trim())) {
      setErrors((prev) => ({
        ...prev,
        phone: "Please enter a valid 10-digit mobile number starting with 6-9.",
      }));
      return false;
    }
    setErrors((prev) => ({ ...prev, phone: undefined }));
    return true;
  };

  const validateName = (value: string): boolean => {
    if (!value.trim()) {
      setErrors((prev) => ({ ...prev, name: "Please enter your full name." }));
      return false;
    }
    if (value.trim().length < 2) {
      setErrors((prev) => ({
        ...prev,
        name: "Full name must be at least 2 characters.",
      }));
      return false;
    }
    setErrors((prev) => ({ ...prev, name: undefined }));
    return true;
  };

  const validateUtr = (value: string, method: AppointmentPaymentMethod): boolean => {
    if (method === "online") {
      if (!value.trim()) {
        setErrors((prev) => ({
          ...prev,
          paymentReference: "Please enter your 12-digit UTR or UPI transaction reference.",
        }));
        return false;
      }
      if (value.trim().length < 6) {
        setErrors((prev) => ({
          ...prev,
          paymentReference: "Please enter a valid payment reference / UTR number.",
        }));
        return false;
      }
    }
    setErrors((prev) => ({ ...prev, paymentReference: undefined }));
    return true;
  };

  const handlePaymentMethodChange = (method: AppointmentPaymentMethod) => {
    setPaymentMethod(method);
    if (method === "salon") {
      setErrors((prev) => ({ ...prev, paymentReference: undefined }));
    } else if (hasAttemptedSubmit) {
      validateUtr(paymentReference, "online");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);

    const isNameValid = validateName(name);
    const isPhoneValid = validatePhone(phone);
    const isUtrValid = validateUtr(paymentReference, paymentMethod);

    if (!isNameValid || !isPhoneValid || !isUtrValid) {
      return;
    }

    const appointmentId = generateAppointmentReference();
    const formattedDate = formatDateToDisplay(selectedDate);
    const siteOrigin = typeof window !== "undefined" ? window.location.origin : undefined;

    const payload: AppointmentPayload = {
      appointmentId,
      service: {
        id: service.id,
        name: service.name,
        category: service.subCategory || "Facial",
        duration: service.duration,
        description: service.description,
        price: service.price,
        image: service.image,
      },
      bookingType,
      date: formattedDate,
      time: selectedTime,
      customer: {
        name: name.trim(),
        phone: phone.trim(),
        specialRequests: notes.trim() || undefined,
      },
      payment: {
        method: paymentMethod,
        paymentReference: paymentMethod === "online" ? paymentReference.trim() : undefined,
      },
    };

    const waMessage = formatWhatsAppAppointmentMessage(payload, siteOrigin);
    const waUrl = `https://wa.me/${BUSINESS_WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`;

    setConfirmedAppointmentId(appointmentId);
    setConfirmedWhatsappUrl(waUrl);
    setIsBooked(true);

    // Open WhatsApp in new tab
    try {
      if (typeof window !== "undefined") {
        window.open(waUrl, "_blank", "noopener,noreferrer");
      }
    } catch {
      // Handled via confirmation screen CTA
    }
  };

  const handleCopyAppointmentId = () => {
    if (confirmedAppointmentId) {
      navigator.clipboard.writeText(confirmedAppointmentId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleResetAndClose = () => {
    setIsBooked(false);
    setName("");
    setPhone("");
    setNotes("");
    setPaymentReference("");
    setPaymentMethod("salon");
    setBookingType("myself");
    setErrors({});
    setHasAttemptedSubmit(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-[#FAF7F3] rounded-2xl border border-[#C5A47E]/50 shadow-2xl p-5 sm:p-7 md:p-8 text-[#231610]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleResetAndClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-[#231610] text-[#231610] hover:text-white border border-[#EAE2D8] flex items-center justify-center transition-colors shadow-sm focus:outline-none cursor-pointer"
          aria-label="Close appointment modal"
        >
          <X className="w-4 h-4 stroke-[1.5]" />
        </button>

        {isBooked ? (
          /* ========================================================================= */
          /* CONFIRMATION SCREEN                                                      */
          /* ========================================================================= */
          <div className="flex flex-col items-center text-center py-4 sm:py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#A57D4E]/10 border border-[#A57D4E] flex items-center justify-center text-[#A57D4E] animate-in zoom-in-95 duration-300">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-[#A57D4E] tracking-widest uppercase">
                INSHA COLLECTIONS SALON
              </span>
              <h3 className="text-xl sm:text-2xl font-normal text-[#231610] font-serif-luxury uppercase tracking-wider">
                Appointment Requested!
              </h3>
            </div>

            {/* Appointment ID Badge */}
            <div className="bg-white border border-[#C5A47E]/40 px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-3">
              <span className="text-xs text-[#7A6F68]">Appointment ID:</span>
              <span className="text-xs sm:text-sm font-bold font-mono text-[#231610]">
                {confirmedAppointmentId}
              </span>
              <button
                type="button"
                onClick={handleCopyAppointmentId}
                className="text-[#A57D4E] hover:text-[#231610] transition-colors p-1 cursor-pointer"
                title="Copy Appointment ID"
              >
                {copiedId ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            <p className="text-xs sm:text-sm text-[#6B5E55] max-w-md leading-relaxed">
              Thank you, <span className="font-semibold text-[#231610]">{name}</span>. We have prepared your salon booking details for{" "}
              <span className="font-semibold text-[#231610]">{service.name}</span> on{" "}
              <span className="font-semibold text-[#231610]">{formatDateToDisplay(selectedDate)}</span> at{" "}
              <span className="font-semibold text-[#231610]">{selectedTime}</span>.
            </p>

            {/* Appointment Summary Box */}
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#EAE2D8] w-full max-w-md text-left text-xs space-y-2 text-[#6B5E55] shadow-xs">
              <div className="flex justify-between items-center border-b border-[#F5ECE5] pb-2">
                <span className="font-medium">Service:</span>
                <span className="font-bold text-[#231610] text-right truncate max-w-[200px]">{service.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Category:</span>
                <span className="font-semibold text-[#231610]">{service.subCategory}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Duration:</span>
                <span className="font-semibold text-[#231610]">{service.duration}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Booking Type:</span>
                <span className="font-semibold text-[#231610]">
                  {bookingType === "gift" ? "For Gift" : "For Myself"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Payment Method:</span>
                <span className="font-semibold text-[#231610]">
                  {paymentMethod === "online" ? "Online Payment (PhonePe)" : "Pay at Salon"}
                </span>
              </div>
              {paymentMethod === "online" && paymentReference && (
                <div className="flex justify-between items-center">
                  <span>UTR / Ref:</span>
                  <span className="font-mono font-medium text-[#231610]">{paymentReference}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-[#F5ECE5] text-sm font-bold text-[#231610]">
                <span>Service Fee:</span>
                <span className="text-[#A57D4E]">₹{service.price.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Primary Action Button: Open WhatsApp */}
            <div className="w-full max-w-md pt-2 space-y-2.5">
              <a
                href={confirmedWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-6 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2.5 text-center cursor-pointer"
              >
                <WhatsAppIcon className="w-5 h-5 fill-current" />
                <span>OPEN IN WHATSAPP TO SEND</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full py-3 rounded-xl bg-[#231610] hover:bg-[#A57D4E] text-[#FAF7F3] text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>

            <p className="text-[11px] text-[#8C7E74]">
              Official Concierge: +91 9618648050 • Insha Collections Luxury Salon Suite
            </p>
          </div>
        ) : (
          /* ========================================================================= */
          /* BOOKING FORM                                                             */
          /* ========================================================================= */
          <div>
            {/* Header: Service Banner */}
            <div className="flex items-start gap-4 pb-4 border-b border-[#EAE2D8]">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 border border-[#EAE2D8] bg-white">
                <Image
                  src={service.image}
                  alt={service.name}
                  fill
                  sizes="(max-width: 640px) 64px, 80px"
                  className="object-cover object-center"
                />
              </div>

              <div className="flex-1 min-w-0">
                <span className="text-[10.5px] sm:text-[11px] font-semibold text-[#A57D4E] uppercase tracking-wider block truncate">
                  {service.subCategory} • {service.duration}
                </span>
                <h3 className="text-sm sm:text-base font-normal text-[#231610] font-serif-luxury tracking-wide truncate">
                  {service.name}
                </h3>
                <div className="flex items-center gap-3 mt-1 text-xs">
                  <span className="font-bold text-[#231610] text-sm sm:text-base">
                    ₹{service.price.toLocaleString("en-IN")}
                  </span>
                  <div className="flex items-center gap-1 text-[#D97706]">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="font-semibold text-[#231610]">{service.rating}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-4 sm:space-y-5" noValidate>
              {/* ========================================================================= */}
              {/* BOOKING TYPE SELECTION                                                    */}
              {/* ========================================================================= */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#A57D4E] uppercase tracking-wider">
                  BOOKING TYPE <span className="text-[#A57D4E]">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* For Myself */}
                  <label
                    onClick={() => setBookingType("myself")}
                    className={`relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                      bookingType === "myself"
                        ? "border-[#A57D4E] bg-white shadow-xs ring-1 ring-[#A57D4E]/30"
                        : "border-[#EAE2D8] bg-white/70 hover:border-[#D5C2AF] hover:bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="bookingType"
                      value="myself"
                      checked={bookingType === "myself"}
                      onChange={() => setBookingType("myself")}
                      className="w-4 h-4 text-[#A57D4E] focus:ring-[#A57D4E] accent-[#A57D4E] cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#A57D4E]" />
                        <span className="text-xs font-semibold text-[#231610]">For Myself</span>
                      </div>
                      <p className="text-[10.5px] text-[#7A6F68]">Reservation for my own visit</p>
                    </div>
                  </label>

                  {/* For Gift */}
                  <label
                    onClick={() => setBookingType("gift")}
                    className={`relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                      bookingType === "gift"
                        ? "border-[#A57D4E] bg-white shadow-xs ring-1 ring-[#A57D4E]/30"
                        : "border-[#EAE2D8] bg-white/70 hover:border-[#D5C2AF] hover:bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="bookingType"
                      value="gift"
                      checked={bookingType === "gift"}
                      onChange={() => setBookingType("gift")}
                      className="w-4 h-4 text-[#A57D4E] focus:ring-[#A57D4E] accent-[#A57D4E] cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <Gift className="w-3.5 h-3.5 text-[#A57D4E]" />
                        <span className="text-xs font-semibold text-[#231610]">For Gift</span>
                      </div>
                      <p className="text-[10.5px] text-[#7A6F68]">Salon pamper package for a loved one</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* DATE & TIME SELECTION                                                     */}
              {/* ========================================================================= */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#231610] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#C5A47E]" />
                    Date <span className="text-[#A57D4E]">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs sm:text-sm bg-white border border-[#EAE2D8] rounded-xl focus:outline-none focus:border-[#C5A47E] focus:ring-1 focus:ring-[#C5A47E] text-[#231610] cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#231610] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#C5A47E]" />
                    Time Slot <span className="text-[#A57D4E]">*</span>
                  </label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs sm:text-sm bg-white border border-[#EAE2D8] rounded-xl focus:outline-none focus:border-[#C5A47E] focus:ring-1 focus:ring-[#C5A47E] text-[#231610] cursor-pointer"
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* CUSTOMER DETAILS                                                         */}
              {/* ========================================================================= */}
              <div className="space-y-1 border-t border-[#EAE2D8] pt-3">
                <span className="text-[10px] font-semibold text-[#A57D4E] tracking-widest uppercase">
                  CUSTOMER DETAILS
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#231610] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#C5A47E]" />
                    Full Name <span className="text-[#A57D4E]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sameer"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (hasAttemptedSubmit) validateName(e.target.value);
                    }}
                    className={`w-full px-3 py-2.5 text-xs sm:text-sm bg-white border ${
                      errors.name ? "border-[#C53030] ring-1 ring-[#C53030]" : "border-[#EAE2D8]"
                    } rounded-xl focus:outline-none focus:border-[#C5A47E] text-[#231610] placeholder-[#A09388]`}
                  />
                  {errors.name && (
                    <p className="text-[11px] text-[#C53030] mt-1 font-medium">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#231610] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#C5A47E]" />
                    Phone Number <span className="text-[#A57D4E]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="e.g. 9618648050"
                    value={phone}
                    onChange={handlePhoneChange}
                    className={`w-full px-3 py-2.5 text-xs sm:text-sm bg-white border ${
                      errors.phone ? "border-[#C53030] ring-1 ring-[#C53030]" : "border-[#EAE2D8]"
                    } rounded-xl focus:outline-none focus:border-[#C5A47E] text-[#231610] placeholder-[#A09388]`}
                  />
                  {errors.phone && (
                    <p className="text-[11px] text-[#C53030] mt-1 font-medium">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Special Preferences / Requests */}
              <div>
                <label className="block text-xs font-semibold text-[#231610] uppercase tracking-wider mb-1.5">
                  Special Preferences / Requests <span className="text-[#7A6F68] font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Sensitive skin, bridal consultation, preferred therapist..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#EAE2D8] rounded-xl focus:outline-none focus:border-[#C5A47E] text-[#231610] placeholder-[#A09388] resize-none"
                />
              </div>

              {/* ========================================================================= */}
              {/* PAYMENT METHOD SELECTION                                                 */}
              {/* ========================================================================= */}
              <div className="space-y-3 pt-2 border-t border-[#EAE2D8]">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-semibold text-[#A57D4E] tracking-widest uppercase">
                    PAYMENT DETAILS
                  </span>
                  <label className="block text-xs font-semibold text-[#231610] uppercase tracking-wider">
                    Payment Method <span className="text-[#A57D4E]">*</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Pay at Salon */}
                  <label
                    onClick={() => handlePaymentMethodChange("salon")}
                    className={`relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                      paymentMethod === "salon"
                        ? "border-[#A57D4E] bg-white shadow-xs ring-1 ring-[#A57D4E]/30"
                        : "border-[#EAE2D8] bg-white/70 hover:border-[#D5C2AF] hover:bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="salon"
                      checked={paymentMethod === "salon"}
                      onChange={() => handlePaymentMethodChange("salon")}
                      className="w-4 h-4 text-[#A57D4E] focus:ring-[#A57D4E] accent-[#A57D4E] cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <Banknote className="w-3.5 h-3.5 text-[#A57D4E]" />
                        <span className="text-xs font-semibold text-[#231610]">Pay at Salon</span>
                      </div>
                      <p className="text-[10.5px] text-[#7A6F68]">Cash or Card upon salon visit</p>
                    </div>
                  </label>

                  {/* Online Payment */}
                  <label
                    onClick={() => handlePaymentMethodChange("online")}
                    className={`relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                      paymentMethod === "online"
                        ? "border-[#A57D4E] bg-white shadow-xs ring-1 ring-[#A57D4E]/30"
                        : "border-[#EAE2D8] bg-white/70 hover:border-[#D5C2AF] hover:bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={paymentMethod === "online"}
                      onChange={() => handlePaymentMethodChange("online")}
                      className="w-4 h-4 text-[#A57D4E] focus:ring-[#A57D4E] accent-[#A57D4E] cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <QrCode className="w-3.5 h-3.5 text-[#A57D4E]" />
                        <span className="text-xs font-semibold text-[#231610]">Online Payment</span>
                      </div>
                      <p className="text-[10.5px] text-[#7A6F68]">Scan & Pay using PhonePe QR</p>
                    </div>
                  </label>
                </div>

                {/* Online Payment with PhonePe QR */}
                {paymentMethod === "online" && (
                  <div className="p-4 rounded-xl bg-white border border-[#A57D4E]/40 shadow-xs space-y-3.5 animate-in fade-in duration-200">
                    <div className="text-center space-y-0.5 border-b border-[#F5ECE5] pb-2">
                      <span className="text-[10px] font-semibold text-[#A57D4E] tracking-widest uppercase">
                        ONLINE PAYMENT
                      </span>
                      <h4 className="text-xs sm:text-sm font-semibold text-[#231610]">
                        Scan & Pay ₹{service.price.toLocaleString("en-IN")} using PhonePe
                      </h4>
                    </div>

                    <div className="flex flex-col items-center justify-center space-y-2.5">
                      <div className="relative w-48 sm:w-56 aspect-[1/2] rounded-xl overflow-hidden border border-[#EAE2D8] shadow-sm bg-white p-1">
                        <Image
                          src="/images/payment/phonepe-qr.png"
                          alt="Scan & Pay using PhonePe QR Code"
                          fill
                          loading="lazy"
                          sizes="(max-width: 640px) 192px, 224px"
                          className="object-contain"
                        />
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-[#5A4D45] bg-[#F5ECE5] px-3 py-1.5 rounded-lg text-center">
                        <Info className="w-3.5 h-3.5 text-[#A57D4E] flex-shrink-0" />
                        <span>Please complete payment before requesting the slot.</span>
                      </div>
                    </div>

                    {/* UTR Reference Input */}
                    <div>
                      <label
                        htmlFor="paymentReference"
                        className="block text-xs font-medium text-[#231610] tracking-wide mb-1"
                      >
                        Payment Reference / UTR Number <span className="text-[#A57D4E]">*</span>
                      </label>
                      <input
                        id="paymentReference"
                        name="paymentReference"
                        type="text"
                        value={paymentReference}
                        onChange={(e) => {
                          setPaymentReference(e.target.value);
                          if (hasAttemptedSubmit) validateUtr(e.target.value, "online");
                        }}
                        placeholder="Enter 12-digit UTR or UPI transaction reference"
                        className={`w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl bg-white border ${
                          errors.paymentReference
                            ? "border-[#C53030] ring-1 ring-[#C53030]"
                            : "border-[#D5C2AF]"
                        } text-[#231610] placeholder-[#A09388] focus:outline-none focus:border-[#A57D4E]`}
                      />
                      {errors.paymentReference && (
                        <p className="text-[11px] text-[#C53030] mt-1 font-medium">
                          {errors.paymentReference}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#A57D4E] hover:bg-[#8C6839] text-white text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-3 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>CONFIRM APPOINTMENT VIA WHATSAPP</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
