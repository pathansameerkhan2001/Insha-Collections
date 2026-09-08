"use client";

import React from "react";
import { X, MapPin, Clock, Phone, Mail, Navigation, Sparkles } from "lucide-react";

interface StoreLocatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORES = [
  {
    id: "kadapa",
    name: "Insha Collections Boutique & Salon",
    tag: "MAIN STORE & SALON",
    address: "Room no 6, Rachuru complex, Y V Street, Kadapa 516001, Andhra Pradesh, India",
    hours: "Mon - Sat: 10:00 AM - 8:00 PM",
    phone: "+91 9618648050",
    altPhone: "+91 9000407681",
    features: [
      "Anti-Tarnish Jewellery Counter",
      "Korean Accessories Collection",
      "Readymade Dresses & Handlooms",
      "Luxury Beauty & Hair Salon",
    ],
  },
];

export default function StoreLocatorModal({ isOpen, onClose }: StoreLocatorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#FAF7F3] rounded-2xl border border-[#C5A47E]/50 shadow-2xl p-6 sm:p-8 text-[#231610]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-[#231610] text-[#231610] hover:text-white border border-[#EAE2D8] flex items-center justify-center transition-colors shadow-sm focus:outline-none cursor-pointer"
          aria-label="Close Store Locator"
        >
          <X className="w-4 h-4 stroke-[1.5]" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center pb-5 border-b border-[#EAE2D8]">
          <div className="w-12 h-12 rounded-full bg-[#FAF0E4] border border-[#C5A47E] flex items-center justify-center text-[#BA7442] mb-2.5">
            <MapPin className="w-6 h-6 stroke-[1.4]" />
          </div>
          <h2 className="text-xl sm:text-2xl font-normal text-[#231610] font-serif-luxury tracking-widest uppercase">
            OUR STORE LOCATIONS
          </h2>
          <p className="text-xs sm:text-sm text-[#7A6F68] font-cormorant italic mt-0.5">
            Experience the royal world of Insha Collections in person
          </p>
        </div>

        {/* Store List */}
        <div className="mt-6 space-y-6">
          {STORES.map((store) => (
            <div
              key={store.id}
              className="bg-white rounded-xl p-5 sm:p-6 border border-[#EAE2D8] shadow-sm hover:border-[#C5A47E]/60 transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#FAF0E4] text-[#BA7442] text-[10px] font-bold tracking-wider uppercase border border-[#E8D4C1]">
                  {store.tag}
                </span>
                <span className="text-[11px] text-[#15803D] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#15803D] animate-pulse" />
                  Open Today
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-normal text-[#231610] font-serif-luxury tracking-wide">
                {store.name}
              </h3>

              <div className="mt-3.5 space-y-2.5 text-xs text-[#5A4D45]">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#BA7442] flex-shrink-0 mt-0.5" />
                  <span>{store.address}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-[#BA7442] flex-shrink-0" />
                  <span>{store.hours}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-[#BA7442] flex-shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-1">
                    <a href={`tel:${store.phone}`} className="hover:text-[#BA7442] transition-colors">
                      {store.phone}
                    </a>
                    {store.altPhone && (
                      <a href={`tel:${store.altPhone}`} className="hover:text-[#BA7442] transition-colors">
                        {store.altPhone}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Highlights */}
              <div className="mt-4 pt-3 border-t border-[#F2ECE4] flex flex-wrap gap-1.5">
                {store.features.map((f, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#FAF7F3] border border-[#EAE2D8] text-[10.5px] text-[#6B5E55]"
                  >
                    <Sparkles className="w-3 h-3 text-[#C5A47E]" />
                    {f}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-[#F2ECE4] flex items-center justify-between">
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(store.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FAF7F3] hover:bg-[#231610] text-[#231610] hover:text-[#FAF7F3] border border-[#C5A47E] text-xs font-semibold tracking-wider uppercase transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Get Directions</span>
                </a>

                <a
                  href={`tel:${store.phone}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#BA7442] hover:bg-[#9C5A2C] text-white text-xs font-semibold tracking-wider uppercase transition-colors shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Store</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
