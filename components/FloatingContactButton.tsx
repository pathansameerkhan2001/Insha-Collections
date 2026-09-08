"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, ChevronRight } from "lucide-react";
import { WhatsAppIcon, InstagramIcon, GoogleMapsIcon } from "./BrandIcons";
import { BUSINESS_WHATSAPP_NUMBER } from "@/utils/whatsapp";

export default function FloatingContactButton() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);

  // Hide on Admin dashboard routes
  const isAdmin = pathname?.startsWith("/admin");

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (isAdmin) return null;

  const whatsappUrl = `https://wa.me/${BUSINESS_WHATSAPP_NUMBER}`;
  const instagramUrl = "https://www.instagram.com/insha.collections24/";
  const googleMapsUrl = `https://maps.google.com/?q=${encodeURIComponent(
    "Room no 6, Rachuru complex, Y V Street, Kadapa 516001, Andhra Pradesh, India"
  )}`;

  const contactOptions = [
    {
      id: "whatsapp",
      title: "WhatsApp",
      subtitle: "Chat with us",
      href: whatsappUrl,
      icon: (
        <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center flex-shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-105">
          <WhatsAppIcon className="w-5 h-5 fill-white" />
        </div>
      ),
      ariaLabel: "Chat with Insha Collections on WhatsApp",
    },
    {
      id: "instagram",
      title: "Instagram",
      subtitle: "Follow us",
      href: instagramUrl,
      icon: (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white flex items-center justify-center flex-shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-105">
          <InstagramIcon className="w-5 h-5 fill-white" />
        </div>
      ),
      ariaLabel: "Follow Insha Collections on Instagram",
    },
    {
      id: "maps",
      title: "Our Location",
      subtitle: "Find us on Google Maps",
      href: googleMapsUrl,
      icon: (
        <div className="w-10 h-10 rounded-xl bg-white border border-[#EAE2D8] flex items-center justify-center flex-shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-105">
          <GoogleMapsIcon className="w-5 h-5" />
        </div>
      ),
      ariaLabel: "View Insha Collections boutique on Google Maps",
    },
  ];

  return (
    <div
      ref={containerRef}
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end"
    >
      {/* Floating Panel Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="mb-3 w-72 sm:w-80 max-w-[calc(100vw-32px)] bg-[#FAF7F3] rounded-2xl border border-[#DFCAAD] shadow-2xl p-4 text-[#231610] overflow-hidden"
            role="dialog"
            aria-label="Contact options"
          >
            {/* Header / Brand Eyebrow */}
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D8]">
              <div>
                <span className="text-[10px] font-semibold text-[#A57D4E] tracking-[0.2em] uppercase block">
                  Concierge Support
                </span>
                <h3 className="text-sm font-normal text-[#231610] font-serif-luxury tracking-wide mt-0.5">
                  Connect With Us
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-white/80 hover:bg-[#231610] text-[#7A6F68] hover:text-white border border-[#EAE2D8] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close contact menu"
              >
                <X className="w-3.5 h-3.5 stroke-[2]" />
              </button>
            </div>

            {/* Exactly 3 Options */}
            <div className="mt-3 space-y-2">
              {contactOptions.map((opt) => (
                <a
                  key={opt.id}
                  href={opt.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={opt.ariaLabel}
                  onClick={() => setIsOpen(false)}
                  className="group flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-[#FAF0E4] border border-[#EAE2D8] hover:border-[#C5A47E]/60 transition-all duration-200 shadow-xs cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {opt.icon}
                    <div className="text-left">
                      <p className="text-[13.5px] font-semibold text-[#231610] group-hover:text-[#BA7442] transition-colors leading-snug">
                        {opt.title}
                      </p>
                      <p className="text-xs text-[#7A6F68] mt-0.5">{opt.subtitle}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#C5A47E] group-hover:translate-x-0.5 transition-transform" />
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Contact Insha Collections"
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`w-12 h-12 sm:w-13 sm:h-13 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C5A47E]/50 active:scale-95 ${
          isOpen
            ? "bg-[#231610] text-[#FAF7F3] border border-[#C5A47E]/80 shadow-2xl rotate-90"
            : "bg-[#FAF7F3] hover:bg-[#FAF0E4] text-[#231610] border border-[#C5A47E]/70 hover:border-[#BA7442] shadow-black/15 hover:shadow-xl hover:scale-105"
        }`}
      >
        {isOpen ? (
          <X className="w-5 h-5 stroke-[2] text-[#E0C097]" />
        ) : (
          <div className="relative flex items-center justify-center">
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[#BA7442] stroke-[1.75]" />
            {/* Subtle Pulse Indicator */}
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#BA7442] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#BA7442]" />
            </span>
          </div>
        )}
      </button>
    </div>
  );
}
