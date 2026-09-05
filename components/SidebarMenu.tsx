"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  X,
  Home,
  LayoutGrid,
  Gem,
  Shirt,
  Layers,
  Flower2,
  Heart,
  MapPin,
  Info,
  Phone,
  ChevronRight,
  Plus,
  Minus,
  Truck,
  RotateCcw,
  CreditCard,
  Headphones,
} from "lucide-react";
import { CATEGORY_SUBCATEGORIES } from "@/data/catalog";

interface SidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (categoryId: string, subCategory?: string) => void;
  onOpenWishlist: () => void;
  onOpenStoreLocator: () => void;
  onOpenAboutUs: () => void;
  onOpenContactUs: () => void;
}

// Custom Bow Ribbon SVG Icon matching reference
function BowIcon({ className = "w-5 h-5 text-[#C5A47E]" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="2.5" />
      <path d="M9.5 12C5.5 8.5 2 9.5 2 12s3.5 3.5 7.5 0z" />
      <path d="M14.5 12c4-3.5 7.5-2.5 7.5 0s-3.5 3.5-7.5 0z" />
      <path d="M10.5 14L8 21" />
      <path d="M13.5 14L16 21" />
    </svg>
  );
}

// Custom Weave/Handloom SVG Icon matching reference
function WeaveIcon({ className = "w-5 h-5 text-[#C5A47E]" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 8h16M4 16h16M8 4v16M16 4v16" />
      <path d="M6 6l12 12M18 6L6 18" strokeDasharray="1 3" opacity="0.6" />
    </svg>
  );
}

export default function SidebarMenu({
  isOpen,
  onClose,
  onSelectCategory,
  onOpenWishlist,
  onOpenStoreLocator,
  onOpenAboutUs,
  onOpenContactUs,
}: SidebarMenuProps) {
  // Accordion state for expandable categories
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});
  const [subcategoriesMap, setSubcategoriesMap] = useState<Record<string, string[]>>(CATEGORY_SUBCATEGORIES);

  React.useEffect(() => {
    fetch("/api/subcategories")
      .then((res) => res.json())
      .then((data) => {
        if (data.subcategories) {
          setSubcategoriesMap(data.subcategories);
        }
      })
      .catch(() => {});
  }, []);

  if (!isOpen) return null;

  const toggleCategory = (catId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCats((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const handleCategoryClick = (catId: string) => {
    onSelectCategory(catId, "All");
    onClose();
  };

  const handleSubCategoryClick = (catId: string, sub: string) => {
    onSelectCategory(catId, sub);
    onClose();
  };

  const handleHomeClick = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    onClose();
  };

  const handleShopByCategoryClick = () => {
    onSelectCategory("all", "All");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[360px] sm:max-w-[400px] h-full bg-[#FAF7F3] shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-left duration-300 border-r border-[#EAE2D8]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header & Logo Area */}
        <div className="relative pt-6 pb-5 px-6 border-b border-[#EAE2D8]/80 bg-[#FAF7F3] flex flex-col items-center">
          {/* Close Button Top Right */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="absolute top-4 right-4 p-2 text-[#7A6F68] hover:text-[#231610] rounded-full hover:bg-[#EAE2D8]/50 transition-colors focus:outline-none cursor-pointer"
          >
            <X className="w-6 h-6 stroke-[1.4]" />
          </button>

          {/* Centered Circular Logo Badge */}
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full p-2.5 flex items-center justify-center">
            <div className="relative w-full h-full rounded-full overflow-hidden">
              <Image
                src="/images/New-logo.jpeg"
                alt="Insha Collections - Timeless • Elegant • You"
                fill
                priority
                className="object-contain mix-blend-multiply"
                sizes="(max-width: 640px) 128px, 144px"
              />
            </div>
          </div>

          <h2 className="font-serif-luxury text-[15px] sm:text-[16px] tracking-[0.16em] uppercase text-[#231610] font-normal text-center mt-3">
            INSHA COLLECTIONS
          </h2>
          <p className="text-[10px] sm:text-[10.5px] uppercase tracking-[0.24em] text-[#8C7E75] text-center font-sans mt-0.5">
            TIMELESS • ELEGANT • YOU
          </p>
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1 divide-y divide-[#EAE2D8]/60 text-sm">
          {/* 1. HOME */}
          <div className="py-1">
            <button
              type="button"
              onClick={handleHomeClick}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-[#F3ECE4]/60 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <Home className="w-5 h-5 text-[#C5A47E] stroke-[1.4] group-hover:scale-105 transition-transform" />
                <span className="text-[13.5px] sm:text-[14.5px] font-serif-luxury uppercase tracking-[0.14em] text-[#231610] font-normal group-hover:text-[#9C5A2C] transition-colors">
                  HOME
                </span>
              </div>
            </button>
          </div>

          {/* 2. SHOP BY CATEGORY */}
          <div className="py-1">
            <button
              type="button"
              onClick={handleShopByCategoryClick}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-[#F3ECE4]/60 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <LayoutGrid className="w-5 h-5 text-[#C5A47E] stroke-[1.4] group-hover:scale-105 transition-transform" />
                <span className="text-[13.5px] sm:text-[14.5px] font-serif-luxury uppercase tracking-[0.14em] text-[#231610] font-normal group-hover:text-[#9C5A2C] transition-colors">
                  SHOP BY CATEGORY
                </span>
              </div>
            </button>
          </div>

          {/* 3. JEWELLERY (+) */}
          <div className="py-1">
            <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#F3ECE4]/60 transition-colors group">
              <button
                type="button"
                onClick={() => handleCategoryClick("jewellery")}
                className="flex items-center gap-3.5 flex-1 text-left cursor-pointer"
              >
                <Gem className="w-5 h-5 text-[#C5A47E] stroke-[1.4] group-hover:scale-105 transition-transform" />
                <span className="text-[13.5px] sm:text-[14.5px] font-serif-luxury uppercase tracking-[0.14em] text-[#231610] font-normal group-hover:text-[#9C5A2C] transition-colors">
                  JEWELLERY
                </span>
              </button>
              <button
                type="button"
                onClick={(e) => toggleCategory("jewellery", e)}
                aria-label="Toggle jewellery subcategories"
                className="p-1 text-[#7A6F68] hover:text-[#231610] transition-colors cursor-pointer"
              >
                {expandedCats["jewellery"] ? (
                  <Minus className="w-4 h-4 stroke-[1.8] text-[#C5A47E]" />
                ) : (
                  <Plus className="w-4 h-4 stroke-[1.8] text-[#8C7E75]" />
                )}
              </button>
            </div>

            {/* Expanded Subcategories */}
            {expandedCats["jewellery"] && (
              <div className="pl-11 pr-3 py-1 space-y-1 bg-[#FAF4ED]/50 rounded-lg animate-in fade-in slide-in-from-top-1 duration-150">
                {(subcategoriesMap.jewellery || CATEGORY_SUBCATEGORIES.jewellery).map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => handleSubCategoryClick("jewellery", sub)}
                    className="block w-full text-left py-1 text-xs text-[#5A4D45] hover:text-[#9C5A2C] font-sans font-medium transition-colors"
                  >
                    • {sub}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 4. KOREAN ITEMS (+) */}
          <div className="py-1">
            <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#F3ECE4]/60 transition-colors group">
              <button
                type="button"
                onClick={() => handleCategoryClick("korean")}
                className="flex items-center gap-3.5 flex-1 text-left cursor-pointer"
              >
                <BowIcon className="w-5 h-5 text-[#C5A47E] group-hover:scale-105 transition-transform" />
                <span className="text-[13.5px] sm:text-[14.5px] font-serif-luxury uppercase tracking-[0.14em] text-[#231610] font-normal group-hover:text-[#9C5A2C] transition-colors">
                  KOREAN ITEMS
                </span>
              </button>
              <button
                type="button"
                onClick={(e) => toggleCategory("korean", e)}
                aria-label="Toggle korean items subcategories"
                className="p-1 text-[#7A6F68] hover:text-[#231610] transition-colors cursor-pointer"
              >
                {expandedCats["korean"] ? (
                  <Minus className="w-4 h-4 stroke-[1.8] text-[#C5A47E]" />
                ) : (
                  <Plus className="w-4 h-4 stroke-[1.8] text-[#8C7E75]" />
                )}
              </button>
            </div>

            {expandedCats["korean"] && (
              <div className="pl-11 pr-3 py-1 space-y-1 bg-[#FAF4ED]/50 rounded-lg animate-in fade-in slide-in-from-top-1 duration-150">
                {(subcategoriesMap.korean || CATEGORY_SUBCATEGORIES.korean).map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => handleSubCategoryClick("korean", sub)}
                    className="block w-full text-left py-1 text-xs text-[#5A4D45] hover:text-[#9C5A2C] font-sans font-medium transition-colors"
                  >
                    • {sub}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 5. READYMADE DRESSES (+) */}
          <div className="py-1">
            <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#F3ECE4]/60 transition-colors group">
              <button
                type="button"
                onClick={() => handleCategoryClick("dresses")}
                className="flex items-center gap-3.5 flex-1 text-left cursor-pointer"
              >
                <Shirt className="w-5 h-5 text-[#C5A47E] stroke-[1.4] group-hover:scale-105 transition-transform" />
                <span className="text-[13.5px] sm:text-[14.5px] font-serif-luxury uppercase tracking-[0.14em] text-[#231610] font-normal group-hover:text-[#9C5A2C] transition-colors">
                  READYMADE DRESSES
                </span>
              </button>
              <button
                type="button"
                onClick={(e) => toggleCategory("dresses", e)}
                aria-label="Toggle readymade dresses subcategories"
                className="p-1 text-[#7A6F68] hover:text-[#231610] transition-colors cursor-pointer"
              >
                {expandedCats["dresses"] ? (
                  <Minus className="w-4 h-4 stroke-[1.8] text-[#C5A47E]" />
                ) : (
                  <Plus className="w-4 h-4 stroke-[1.8] text-[#8C7E75]" />
                )}
              </button>
            </div>

            {expandedCats["dresses"] && (
              <div className="pl-11 pr-3 py-1 space-y-1 bg-[#FAF4ED]/50 rounded-lg animate-in fade-in slide-in-from-top-1 duration-150">
                {(subcategoriesMap.dresses || CATEGORY_SUBCATEGORIES.dresses).map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => handleSubCategoryClick("dresses", sub)}
                    className="block w-full text-left py-1 text-xs text-[#5A4D45] hover:text-[#9C5A2C] font-sans font-medium transition-colors"
                  >
                    • {sub}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 6. DRESS MATERIALS (+) */}
          <div className="py-1">
            <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#F3ECE4]/60 transition-colors group">
              <button
                type="button"
                onClick={() => handleCategoryClick("materials")}
                className="flex items-center gap-3.5 flex-1 text-left cursor-pointer"
              >
                <Layers className="w-5 h-5 text-[#C5A47E] stroke-[1.4] group-hover:scale-105 transition-transform" />
                <span className="text-[13.5px] sm:text-[14.5px] font-serif-luxury uppercase tracking-[0.14em] text-[#231610] font-normal group-hover:text-[#9C5A2C] transition-colors">
                  DRESS MATERIALS
                </span>
              </button>
              <button
                type="button"
                onClick={(e) => toggleCategory("materials", e)}
                aria-label="Toggle dress materials subcategories"
                className="p-1 text-[#7A6F68] hover:text-[#231610] transition-colors cursor-pointer"
              >
                {expandedCats["materials"] ? (
                  <Minus className="w-4 h-4 stroke-[1.8] text-[#C5A47E]" />
                ) : (
                  <Plus className="w-4 h-4 stroke-[1.8] text-[#8C7E75]" />
                )}
              </button>
            </div>

            {expandedCats["materials"] && (
              <div className="pl-11 pr-3 py-1 space-y-1 bg-[#FAF4ED]/50 rounded-lg animate-in fade-in slide-in-from-top-1 duration-150">
                {(subcategoriesMap.materials || CATEGORY_SUBCATEGORIES.materials).map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => handleSubCategoryClick("materials", sub)}
                    className="block w-full text-left py-1 text-xs text-[#5A4D45] hover:text-[#9C5A2C] font-sans font-medium transition-colors"
                  >
                    • {sub}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 7. HANDLOOMS (+) */}
          <div className="py-1">
            <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#F3ECE4]/60 transition-colors group">
              <button
                type="button"
                onClick={() => handleCategoryClick("handlooms")}
                className="flex items-center gap-3.5 flex-1 text-left cursor-pointer"
              >
                <WeaveIcon className="w-5 h-5 text-[#C5A47E] group-hover:scale-105 transition-transform" />
                <span className="text-[13.5px] sm:text-[14.5px] font-serif-luxury uppercase tracking-[0.14em] text-[#231610] font-normal group-hover:text-[#9C5A2C] transition-colors">
                  HANDLOOMS
                </span>
              </button>
              <button
                type="button"
                onClick={(e) => toggleCategory("handlooms", e)}
                aria-label="Toggle handlooms subcategories"
                className="p-1 text-[#7A6F68] hover:text-[#231610] transition-colors cursor-pointer"
              >
                {expandedCats["handlooms"] ? (
                  <Minus className="w-4 h-4 stroke-[1.8] text-[#C5A47E]" />
                ) : (
                  <Plus className="w-4 h-4 stroke-[1.8] text-[#8C7E75]" />
                )}
              </button>
            </div>

            {expandedCats["handlooms"] && (
              <div className="pl-11 pr-3 py-1 space-y-1 bg-[#FAF4ED]/50 rounded-lg animate-in fade-in slide-in-from-top-1 duration-150">
                {(subcategoriesMap.handlooms || CATEGORY_SUBCATEGORIES.handlooms).map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => handleSubCategoryClick("handlooms", sub)}
                    className="block w-full text-left py-1 text-xs text-[#5A4D45] hover:text-[#9C5A2C] font-sans font-medium transition-colors"
                  >
                    • {sub}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 8. BEAUTY & SALON (+) */}
          <div className="py-1">
            <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#F3ECE4]/60 transition-colors group">
              <button
                type="button"
                onClick={() => handleCategoryClick("beauty")}
                className="flex items-center gap-3.5 flex-1 text-left cursor-pointer"
              >
                <Flower2 className="w-5 h-5 text-[#C5A47E] stroke-[1.4] group-hover:scale-105 transition-transform" />
                <span className="text-[13.5px] sm:text-[14.5px] font-serif-luxury uppercase tracking-[0.14em] text-[#231610] font-normal group-hover:text-[#9C5A2C] transition-colors">
                  BEAUTY & SALON
                </span>
              </button>
              <button
                type="button"
                onClick={(e) => toggleCategory("beauty", e)}
                aria-label="Toggle beauty & salon subcategories"
                className="p-1 text-[#7A6F68] hover:text-[#231610] transition-colors cursor-pointer"
              >
                {expandedCats["beauty"] ? (
                  <Minus className="w-4 h-4 stroke-[1.8] text-[#C5A47E]" />
                ) : (
                  <Plus className="w-4 h-4 stroke-[1.8] text-[#8C7E75]" />
                )}
              </button>
            </div>

            {expandedCats["beauty"] && (
              <div className="pl-11 pr-3 py-1 space-y-1 bg-[#FAF4ED]/50 rounded-lg animate-in fade-in slide-in-from-top-1 duration-150">
                {(subcategoriesMap.beauty || CATEGORY_SUBCATEGORIES.beauty).map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => handleSubCategoryClick("beauty", sub)}
                    className="block w-full text-left py-1 text-xs text-[#5A4D45] hover:text-[#9C5A2C] font-sans font-medium transition-colors"
                  >
                    • {sub}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 9. WISHLIST */}
          <div className="py-1">
            <button
              type="button"
              onClick={() => {
                onOpenWishlist();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left hover:bg-[#F3ECE4]/60 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <Heart className="w-5 h-5 text-[#C5A47E] stroke-[1.4] group-hover:scale-105 transition-transform" />
                <span className="text-[13.5px] sm:text-[14.5px] font-serif-luxury uppercase tracking-[0.14em] text-[#231610] font-normal group-hover:text-[#9C5A2C] transition-colors">
                  WISHLIST
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8C7E75] stroke-[1.5]" />
            </button>
          </div>

          {/* 10. STORE LOCATOR */}
          <div className="py-1">
            <button
              type="button"
              onClick={() => {
                onOpenStoreLocator();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left hover:bg-[#F3ECE4]/60 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <MapPin className="w-5 h-5 text-[#C5A47E] stroke-[1.4] group-hover:scale-105 transition-transform" />
                <span className="text-[13.5px] sm:text-[14.5px] font-serif-luxury uppercase tracking-[0.14em] text-[#231610] font-normal group-hover:text-[#9C5A2C] transition-colors">
                  STORE LOCATOR
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8C7E75] stroke-[1.5]" />
            </button>
          </div>

          {/* 11. ABOUT US */}
          <div className="py-1">
            <button
              type="button"
              onClick={() => {
                onOpenAboutUs();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left hover:bg-[#F3ECE4]/60 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <Info className="w-5 h-5 text-[#C5A47E] stroke-[1.4] group-hover:scale-105 transition-transform" />
                <span className="text-[13.5px] sm:text-[14.5px] font-serif-luxury uppercase tracking-[0.14em] text-[#231610] font-normal group-hover:text-[#9C5A2C] transition-colors">
                  ABOUT US
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8C7E75] stroke-[1.5]" />
            </button>
          </div>

          {/* 12. CONTACT US */}
          <div className="py-1">
            <button
              type="button"
              onClick={() => {
                onOpenContactUs();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left hover:bg-[#F3ECE4]/60 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <Phone className="w-5 h-5 text-[#C5A47E] stroke-[1.4] group-hover:scale-105 transition-transform" />
                <span className="text-[13.5px] sm:text-[14.5px] font-serif-luxury uppercase tracking-[0.14em] text-[#231610] font-normal group-hover:text-[#9C5A2C] transition-colors">
                  CONTACT US
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8C7E75] stroke-[1.5]" />
            </button>
          </div>
        </div>

        {/* Bottom Feature Badges Bar (Exact 4 Columns Matching Reference) */}
        <div className="bg-[#F6EFE7] border-t border-[#EAE2D8] py-4 px-2 sm:px-3">
          <div className="grid grid-cols-4 gap-1 sm:gap-2 text-center">
            {/* 1. Free Shipping */}
            <div className="flex flex-col items-center justify-center p-1">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-[#BA7442] stroke-[1.4] mb-1" />
              <span className="text-[8px] sm:text-[9px] font-bold text-[#231610] uppercase tracking-wider leading-none">
                FREE
                <br />
                SHIPPING
              </span>
              <span className="text-[7px] sm:text-[7.5px] text-[#7A6F68] font-normal leading-tight mt-1 line-clamp-2">
                On orders above ₹999
              </span>
            </div>

            {/* 2. Easy Returns */}
            <div className="flex flex-col items-center justify-center p-1">
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-[#BA7442] stroke-[1.4] mb-1" />
              <span className="text-[8px] sm:text-[9px] font-bold text-[#231610] uppercase tracking-wider leading-none">
                EASY
                <br />
                RETURNS
              </span>
              <span className="text-[7px] sm:text-[7.5px] text-[#7A6F68] font-normal leading-tight mt-1 line-clamp-2">
                Hassle-free returns
              </span>
            </div>

            {/* 3. Secure Payments */}
            <div className="flex flex-col items-center justify-center p-1">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-[#BA7442] stroke-[1.4] mb-1" />
              <span className="text-[8px] sm:text-[9px] font-bold text-[#231610] uppercase tracking-wider leading-none">
                SECURE
                <br />
                PAYMENTS
              </span>
              <span className="text-[7px] sm:text-[7.5px] text-[#7A6F68] font-normal leading-tight mt-1 line-clamp-2">
                100% secure checkout
              </span>
            </div>

            {/* 4. Support */}
            <div className="flex flex-col items-center justify-center p-1">
              <Headphones className="w-4 h-4 sm:w-5 sm:h-5 text-[#BA7442] stroke-[1.4] mb-1" />
              <span className="text-[8px] sm:text-[9px] font-bold text-[#231610] uppercase tracking-wider leading-none">
                SUPPORT
                <br />
                WE ARE HERE
              </span>
              <span className="text-[7px] sm:text-[7.5px] text-[#7A6F68] font-normal leading-tight mt-1 line-clamp-2">
                We are here to help
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
