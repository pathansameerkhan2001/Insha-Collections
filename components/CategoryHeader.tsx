import React from "react";

export default function CategoryHeader() {
  return (
    <section id="shop-by-category" className="w-full bg-[#FAF7F3] py-10 sm:py-14 md:py-16">
      <div className="max-w-[1440px] mx-auto px-4 flex items-center justify-center">
        <div className="flex items-center gap-3 sm:gap-5 md:gap-6">
          {/* Left Decorative Gold Tapered Line */}
          <div className="h-[1px] w-10 sm:w-16 md:w-24 bg-gradient-to-r from-transparent via-[#C5A47E]/60 to-[#C5A47E]" />

          {/* Left Sparkle Ornament */}
          <span className="text-[#C5A47E] text-xs sm:text-sm select-none">✧</span>

          {/* Heading */}
          <h2 className="text-xl sm:text-2xl md:text-[26px] font-normal text-[#231610] tracking-[0.2em] uppercase font-serif-luxury text-center whitespace-nowrap">
            SHOP BY CATEGORY
          </h2>

          {/* Right Sparkle Ornament */}
          <span className="text-[#C5A47E] text-xs sm:text-sm select-none">✧</span>

          {/* Right Decorative Gold Tapered Line */}
          <div className="h-[1px] w-10 sm:w-16 md:w-24 bg-gradient-to-l from-transparent via-[#C5A47E]/60 to-[#C5A47E]" />
        </div>
      </div>
    </section>
  );
}
