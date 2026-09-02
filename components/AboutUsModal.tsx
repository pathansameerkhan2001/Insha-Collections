"use client";

import React from "react";
import Image from "next/image";
import { X, Sparkles, Gem, Award, ShieldCheck, Heart, Eye, Target } from "lucide-react";

interface AboutUsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutUsModal({ isOpen, onClose }: AboutUsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#FAF7F3] rounded-2xl border border-[#C5A47E]/50 shadow-2xl p-6 sm:p-8 md:p-10 text-[#231610]"
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

        {/* Brand Monogram Header */}
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
          <h2 className="text-xl sm:text-2xl md:text-3xl font-normal text-[#231610] font-serif-luxury tracking-widest uppercase mt-1">
            ABOUT INSHA COLLECTIONS
          </h2>
          <p className="text-xs sm:text-sm text-[#7A6F68] font-cormorant italic">
            Timeless • Elegant • You
          </p>
        </div>

        {/* Brand Story */}
        <div className="mt-6 space-y-4 text-xs sm:text-sm text-[#5A4D45] leading-relaxed">
          <div className="bg-white p-5 rounded-xl border border-[#EAE2D8] shadow-xs">
            <h3 className="text-sm sm:text-base font-semibold text-[#231610] uppercase tracking-wider font-serif-luxury mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#BA7442]" />
              Our Brand Story
            </h3>
            <p>
              Welcome to <strong className="text-[#231610] font-medium">Insha Collections</strong>, where royal heritage meets modern luxury. Born from a deep appreciation for timeless Indian craft, artisanal weaves, anti-tarnish waterproof jewellery, and bespoke salon experiences, our collections are curated for the woman who values uncompromising elegance and authenticity.
            </p>
          </div>

          {/* Mission & Vision */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-4.5 rounded-xl border border-[#EAE2D8] shadow-xs">
              <h4 className="text-xs sm:text-sm font-semibold text-[#231610] uppercase tracking-wider font-sans mb-1.5 flex items-center gap-2">
                <Target className="w-4 h-4 text-[#BA7442]" />
                Our Mission
              </h4>
              <p className="text-[12px] text-[#7A6F68] leading-relaxed">
                To make heritage-grade luxury and waterproof anti-tarnish artistry accessible to modern women through transparent pricing, authentic craft, and personalized care.
              </p>
            </div>

            <div className="bg-white p-4.5 rounded-xl border border-[#EAE2D8] shadow-xs">
              <h4 className="text-xs sm:text-sm font-semibold text-[#231610] uppercase tracking-wider font-sans mb-1.5 flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#BA7442]" />
                Our Vision
              </h4>
              <p className="text-[12px] text-[#7A6F68] leading-relaxed">
                To become India&apos;s most cherished luxury lifestyle destination, bridging generational weaving communities with contemporary global fashion.
              </p>
            </div>
          </div>
        </div>

        {/* 4 Brand Pillars (Quality Promise & Commitments) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 mt-6">
          <div className="bg-white p-4 rounded-xl border border-[#EAE2D8] flex flex-col items-start space-y-1.5 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-[#FAF0E4] text-[#BA7442] flex items-center justify-center">
              <Gem className="w-4 h-4" />
            </div>
            <h4 className="text-xs sm:text-sm font-semibold text-[#231610] uppercase tracking-wider font-sans">
              Anti-Tarnish Innovation
            </h4>
            <p className="text-[11px] text-[#7A6F68] leading-normal">
              18k & 22k PVD coated waterproof jewellery crafted to withstand daily water, sweat, and perfume without fading.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#EAE2D8] flex flex-col items-start space-y-1.5 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-[#FAF0E4] text-[#BA7442] flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <h4 className="text-xs sm:text-sm font-semibold text-[#231610] uppercase tracking-wider font-sans">
              Artisan Handlooms
            </h4>
            <p className="text-[11px] text-[#7A6F68] leading-normal">
              Directly sourced from master weavers across Varanasi, Chanderi, and Jaipur with genuine hand-block and zari craftsmanship.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#EAE2D8] flex flex-col items-start space-y-1.5 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-[#FAF0E4] text-[#BA7442] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="text-xs sm:text-sm font-semibold text-[#231610] uppercase tracking-wider font-sans">
              Quality Promise
            </h4>
            <p className="text-[11px] text-[#7A6F68] leading-normal">
              Multi-point quality checks, skin-friendly hypoallergenic metals, and honest 7-day hassle-free return policy.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#EAE2D8] flex flex-col items-start space-y-1.5 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-[#FAF0E4] text-[#BA7442] flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
            <h4 className="text-xs sm:text-sm font-semibold text-[#231610] uppercase tracking-wider font-sans">
              Customer Commitment
            </h4>
            <p className="text-[11px] text-[#7A6F68] leading-normal">
              Dedicated styling support, bespoke salon consultations, and doorstep pan-India express insured delivery.
            </p>
          </div>
        </div>

        {/* Footer close */}
        <div className="mt-8 pt-5 border-t border-[#EAE2D8] text-center">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-3 rounded-lg bg-[#231610] hover:bg-[#BA7442] text-[#FAF7F3] text-xs font-semibold tracking-widest uppercase transition-colors shadow-sm cursor-pointer"
          >
            Explore Collections
          </button>
        </div>
      </div>
    </div>
  );
}
