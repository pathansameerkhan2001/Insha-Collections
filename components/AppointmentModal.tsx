"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, Calendar, Clock, User, Phone, Sparkles, CheckCircle2, Star } from "lucide-react";
import { ServiceItem } from "@/data/catalog";

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

export default function AppointmentModal({
  service,
  isOpen,
  onClose,
}: AppointmentModalProps) {
  const [selectedDate, setSelectedDate] = useState("2026-09-05");
  const [selectedTime, setSelectedTime] = useState("11:30 AM");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isBooked, setIsBooked] = useState(false);

  if (!isOpen || !service) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    setIsBooked(true);
  };

  const handleResetAndClose = () => {
    setIsBooked(false);
    setName("");
    setPhone("");
    setNotes("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#FAF7F3] rounded-2xl border border-[#C5A47E]/50 shadow-2xl p-6 sm:p-8 text-[#231610]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleResetAndClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-[#231610] text-[#231610] hover:text-white border border-[#EAE2D8] flex items-center justify-center transition-colors shadow-sm focus:outline-none"
          aria-label="Close"
        >
          <X className="w-4 h-4 stroke-[1.5]" />
        </button>

        {isBooked ? (
          /* Confirmation State */
          <div className="flex flex-col items-center text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#A57D4E]/10 border border-[#A57D4E] flex items-center justify-center text-[#A57D4E]">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-xl sm:text-2xl font-normal text-[#231610] font-serif-luxury uppercase tracking-wider">
              Appointment Confirmed!
            </h3>

            <p className="text-sm text-[#6B5E55] max-w-md">
              Thank you, <span className="font-semibold text-[#231610]">{name}</span>. Your reservation for{" "}
              <span className="font-semibold text-[#231610]">{service.name}</span> on{" "}
              <span className="font-semibold text-[#231610]">{selectedDate}</span> at{" "}
              <span className="font-semibold text-[#231610]">{selectedTime}</span> is confirmed.
            </p>

            <div className="bg-white p-4 rounded-xl border border-[#EAE2D8] w-full max-w-sm text-left text-xs space-y-1.5 text-[#6B5E55]">
              <div className="flex justify-between">
                <span>Service Fee:</span>
                <span className="font-bold text-[#231610]">₹{service.price.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span className="font-medium text-[#231610]">{service.duration}</span>
              </div>
              <div className="flex justify-between">
                <span>Location:</span>
                <span className="font-medium text-[#231610]">Insha Collections Luxury Salon Suite</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetAndClose}
              className="mt-4 px-8 py-3 rounded-lg bg-[#231610] hover:bg-[#A57D4E] text-[#FAF7F3] text-xs font-semibold tracking-wider uppercase transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          /* Booking Form */
          <div>
            {/* Header */}
            <div className="flex items-start gap-4 pb-4 border-b border-[#EAE2D8]">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 border border-[#EAE2D8]">
                <Image
                  src={service.image}
                  alt={service.name}
                  fill
                  sizes="(max-width: 640px) 64px, 80px"
                  className="object-cover object-center"
                />
              </div>

              <div>
                <span className="text-[11px] font-semibold text-[#A57D4E] uppercase tracking-wider">
                  {service.subCategory} • {service.duration}
                </span>
                <h3 className="text-base sm:text-lg font-normal text-[#231610] font-serif-luxury tracking-wide">
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
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#231610] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#C5A47E]" />
                    Select Date
                  </label>
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#EAE2D8] rounded-lg focus:outline-none focus:border-[#C5A47E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#231610] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#C5A47E]" />
                    Select Time Slot
                  </label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#EAE2D8] rounded-lg focus:outline-none focus:border-[#C5A47E]"
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Client Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#231610] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#C5A47E]" />
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ananya Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#EAE2D8] rounded-lg focus:outline-none focus:border-[#C5A47E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#231610] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#C5A47E]" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#EAE2D8] rounded-lg focus:outline-none focus:border-[#C5A47E]"
                  />
                </div>
              </div>

              {/* Special Notes */}
              <div>
                <label className="block text-xs font-semibold text-[#231610] uppercase tracking-wider mb-1.5">
                  Special Preferences or Requests (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Skin sensitivity, pre-bridal consultation, stylist preference..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#EAE2D8] rounded-lg focus:outline-none focus:border-[#C5A47E]"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-[#A57D4E] hover:bg-[#8C6839] text-white text-xs sm:text-sm font-semibold tracking-wider uppercase transition-colors shadow-md flex items-center justify-center gap-2 mt-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Confirm Appointment Booking</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
