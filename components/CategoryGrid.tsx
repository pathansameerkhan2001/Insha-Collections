"use client";

import React from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

interface Category {
  id: string;
  name: string;
  subtitle: string;
  tag: string;
  itemCount: string;
  image: string;
}

const CATEGORIES: Category[] = [
  {
    id: "jewellery",
    name: "Anti Tarnish Jewellery",
    subtitle: "Necklaces, Rings & Bangles",
    tag: "Premium Gold",
    itemCount: "120+ Items",
    image: "/images/cat-jewellery.jpg",
  },
  {
    id: "korean",
    name: "Korean Accessories",
    subtitle: "Claw Clips, Pins & Bows",
    tag: "Trending Now",
    itemCount: "85+ Items",
    image: "/images/cat-korean.jpg",
  },
  {
    id: "dresses",
    name: "Readymade Dresses",
    subtitle: "Anarkalis, Kurtas & Sets",
    tag: "Designer Wear",
    itemCount: "60+ Items",
    image: "/images/cat-dresses.jpg",
  },
  {
    id: "materials",
    name: "Dress Materials",
    subtitle: "Chanderi, Silk & Mulmul",
    tag: "Unstitched Luxury",
    itemCount: "50+ Items",
    image: "/images/hero-readymade-dresses.jpg",
  },
  {
    id: "handlooms",
    name: "Handlooms & Decor",
    subtitle: "Curtains, Covers & Cushions",
    tag: "Artisan Made",
    itemCount: "45+ Items",
    image: "/images/cat-handlooms.jpg",
  },
  {
    id: "beauty",
    name: "Beauty & Salon",
    subtitle: "Facial, Makeup & Hair Spa",
    tag: "Luxury Parlour",
    itemCount: "15+ Services",
    image: "/images/cat-beauty.jpg",
  },
];

interface CategoryGridProps {
  onSelectCategory?: (categoryId: string) => void;
}

export default function CategoryGrid({ onSelectCategory }: CategoryGridProps) {
  const handleClick = (categoryId: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (onSelectCategory) {
      onSelectCategory(categoryId);
    }
    if (typeof window !== "undefined") {
      const elem = document.getElementById("shop-by-category");
      if (elem) {
        elem.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <section className="w-full bg-[#FAF7F3] pt-5 sm:pt-7 md:pt-8 pb-5 sm:pb-8 md:pb-10">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        {/* Compact Royal Section Connector */}
        <div className="flex flex-col items-center text-center mb-4 sm:mb-6">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-1 sm:mb-1.5">
            <div className="h-[1px] w-6 sm:w-12 bg-gradient-to-r from-transparent to-[#C5A47E]" />
            <span className="text-[#C5A47E] text-[10px] sm:text-[11px] font-semibold tracking-[0.24em] uppercase font-sans">
              CURATED FOR YOU
            </span>
            <div className="h-[1px] w-6 sm:w-12 bg-gradient-to-l from-transparent to-[#C5A47E]" />
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-normal text-[#231610] font-serif-luxury tracking-[0.14em] uppercase leading-tight">
            EXPLORE OUR COLLECTIONS
          </h2>
          <p className="text-xs sm:text-sm text-[#7A6F68] font-cormorant italic mt-0.5">
            Timeless styles, carefully selected for you.
          </p>
        </div>

        {/* 6-Card Category Grid: 2 cols on mobile (3 balanced rows), 3 cols on tablet, 6 cols on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={(e) => handleClick(cat.id, e)}
              className="group relative flex flex-col overflow-hidden rounded-xl sm:rounded-2xl bg-[#FAF6F2] border border-[#EAE2D8] hover:border-[#C5A47E]/60 transition-all duration-300 shadow-sm hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A47E] cursor-pointer"
            >
              {/* Image Aspect Container */}
              <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#EFE9E1]">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  quality={95}
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                />

                {/* Subtle Luxury Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#231610]/85 via-[#231610]/25 to-transparent opacity-85 group-hover:opacity-90 transition-opacity duration-300" />

                {/* Top Badge Tag */}
                <div className="absolute top-2 sm:top-2.5 left-2 sm:left-2.5 z-10">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-[#FAF7F3]/90 backdrop-blur-md border border-[#C5A47E]/30 text-[8px] sm:text-[9px] font-semibold tracking-[0.14em] uppercase text-[#231610] shadow-sm">
                    <span className="w-1 h-1 rounded-full bg-[#C5A47E]" />
                    {cat.tag}
                  </span>
                </div>

                {/* Hover Arrow Icon */}
                <div className="absolute top-2 sm:top-2.5 right-2 sm:right-2.5 z-10 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#231610]/40 group-hover:bg-[#C5A47E] text-[#FAF7F3] border border-white/20 flex items-center justify-center transition-all duration-300 shadow-sm group-hover:scale-105">
                  <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>

                {/* Bottom Content Area */}
                <div className="absolute bottom-0 inset-x-0 p-2.5 sm:p-3 z-10 flex flex-col items-start space-y-0.5 sm:space-y-1">
                  <span className="text-[8.5px] sm:text-[9.5px] text-[#DFCAAD] tracking-[0.16em] uppercase font-sans font-medium">
                    {cat.itemCount}
                  </span>

                  <h3 className="text-xs sm:text-[13px] md:text-sm font-normal text-white font-serif-luxury tracking-[0.03em] leading-snug uppercase group-hover:text-[#DFCAAD] transition-colors duration-200 line-clamp-1">
                    {cat.name}
                  </h3>

                  <p className="text-[9.5px] sm:text-[11px] text-[#FAF7F3]/80 font-cormorant italic font-normal line-clamp-1">
                    {cat.subtitle}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
