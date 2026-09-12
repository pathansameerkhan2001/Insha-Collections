"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Sparkles, Quote, ArrowRight, ShoppingBag } from "lucide-react";

interface AboutUsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const timelinePoints = [
  { period: "2018", emoji: "🌱", text: "A simple beginning in RV Nagar, Kadapa" },
  { period: "The Journey", emoji: "🤝", text: "Growing through customers, relationships and experience" },
  { period: "2026", emoji: "✨", text: "A new chapter at YV Street, Kadapa Bazaar" },
  { period: "Today", emoji: "🛍️", text: "Insha Collections expands into the online shopping world" },
  { period: "Tomorrow", emoji: "🌸", text: "Bigger dreams. Better collections. More ways to be part of your everyday moments." },
];

export default function AboutUsModal({ isOpen, onClose }: AboutUsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#FAF7F3] rounded-2xl border border-[#C5A47E]/50 shadow-2xl p-6 sm:p-8 md:p-10 text-[#231610]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-[#231610] text-[#231610] hover:text-white border border-[#EAE2D8] flex items-center justify-center transition-colors shadow-sm focus:outline-none cursor-pointer"
          aria-label="Close About Us"
        >
          <X className="w-4 h-4 stroke-[1.5]" />
        </button>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center pb-5 border-b border-[#EAE2D8]">
          <div className="relative w-28 h-20 sm:w-32 sm:h-24 mb-1">
            <Image
              src="/images/New-logo.jpeg"
              alt="Insha Collections"
              fill
              sizes="(max-width: 640px) 112px, 128px"
              className="object-contain mix-blend-multiply"
            />
          </div>
          <div className="flex items-center gap-2 mt-1 mb-1">
            <div className="h-[1px] w-6 bg-[#C5A47E]" />
            <span className="text-[#A57D4E] text-[10px] font-semibold tracking-[0.24em] uppercase font-sans">
              OUR STORY
            </span>
            <div className="h-[1px] w-6 bg-[#C5A47E]" />
          </div>
          <h2 className="text-xl sm:text-2xl font-normal text-[#231610] font-serif-luxury tracking-wider uppercase">
            INSHA COLLECTIONS
          </h2>
          <p className="text-xs sm:text-sm text-[#7A6F68] font-cormorant italic">
            A Journey Built on Trust • 2018 to Today
          </p>
        </div>

        {/* Story Summary */}
        <div className="mt-5 space-y-4 text-xs sm:text-sm text-[#5A4D45] leading-relaxed">
          <p>
            Every brand has a beginning. Ours began in 2018 in <strong className="text-[#231610]">RV Nagar, Kadapa</strong> with a simple idea — to create a place where people could discover beautiful things, feel valued, and shop with confidence.
          </p>

          {/* Quote Block */}
          <div className="p-4 rounded-xl bg-[#F5ECE5]/90 border border-[#D5C2AF] text-[#231610] font-cormorant italic text-sm sm:text-base leading-snug">
            “When customers choose you, they are giving you more than a sale — they are giving you their trust.”
          </div>

          <p>
            In 2026, we stepped into a new chapter at <strong className="text-[#231610]">YV Street, Kadapa Bazaar</strong>, and launched our e-commerce store to bring our collections beyond our walls to customers everywhere.
          </p>

          {/* 5 Milestone Highlights */}
          <div className="pt-2 space-y-2">
            <h4 className="text-xs font-semibold text-[#BA7442] tracking-wider uppercase font-sans flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Milestones</span>
            </h4>
            <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-[#EAE2D8]">
              {timelinePoints.map((pt) => (
                <div key={pt.period} className="flex items-start gap-2 text-xs">
                  <span className="text-sm select-none">{pt.emoji}</span>
                  <div>
                    <span className="font-semibold text-[#231610]">{pt.period}: </span>
                    <span className="text-[#5A4D45]">{pt.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-[#EAE2D8] flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/about"
            onClick={onClose}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#BA7442] hover:bg-[#9C5A2C] text-white text-xs font-semibold tracking-wider uppercase transition-colors shadow-xs"
          >
            <span>Read Full Story</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#231610] hover:bg-[#3D312A] text-[#FAF7F3] text-xs font-semibold tracking-wider uppercase transition-colors shadow-xs cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Explore Collections</span>
          </button>
        </div>
      </div>
    </div>
  );
}
