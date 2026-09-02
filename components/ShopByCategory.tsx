"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import {
  Heart,
  ShoppingCart,
  Sparkles,
  Gem,
  Shirt,
  Layers,
  Grid as GridIcon,
  Flower2,
  ArrowRight,
  Check,
  Eye,
  Calendar,
  Clock,
  Filter,
} from "lucide-react";
import {
  ProductItem,
  ServiceItem,
  JEWELLERY_PRODUCTS,
  KOREAN_PRODUCTS,
  DRESSES_PRODUCTS,
  MATERIALS_PRODUCTS,
  HANDLOOM_PRODUCTS,
  BEAUTY_SERVICES,
  CATEGORY_SUBCATEGORIES,
} from "@/data/catalog";
import ProductQuickViewModal from "./ProductQuickViewModal";
import AppointmentModal from "./AppointmentModal";

// Bow SVG Icon
function BowIcon({ className = "w-5 h-5" }: { className?: string }) {
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

// All 60 Physical Products (Strictly excludes Beauty & Salon services)
const ALL_PHYSICAL_PRODUCTS: ProductItem[] = [
  ...JEWELLERY_PRODUCTS,
  ...KOREAN_PRODUCTS,
  ...DRESSES_PRODUCTS,
  ...MATERIALS_PRODUCTS,
  ...HANDLOOM_PRODUCTS,
];

interface ShopByCategoryProps {
  activeCategory?: string;
  selectedSubCategory?: string;
  onTabChange?: (tabId: string) => void;
  onSubCategoryChange?: (sub: string) => void;
  onAddToCart?: (product: ProductItem) => void;
  onToggleWishlist?: (productId: string) => void;
  wishlistState?: Record<string, boolean>;
}

export default function ShopByCategory({
  activeCategory = "jewellery",
  selectedSubCategory = "All",
  onTabChange,
  onSubCategoryChange,
  onAddToCart,
  onToggleWishlist,
  wishlistState,
}: ShopByCategoryProps) {
  // Internal state when not externally controlled
  const [internalTab, setInternalTab] = useState<string>(activeCategory);
  const [internalSubCat, setInternalSubCat] = useState<string>(selectedSubCategory);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [localWishlist, setLocalWishlist] = useState<Record<string, boolean>>({});
  const [addedCartIds, setAddedCartIds] = useState<Record<string, boolean>>({});

  // Modals state
  const [quickViewProduct, setQuickViewProduct] = useState<ProductItem | null>(null);
  const [appointmentService, setAppointmentService] = useState<ServiceItem | null>(null);

  // Sync external props with internal state
  useEffect(() => {
    if (activeCategory) {
      setInternalTab(activeCategory);
    }
  }, [activeCategory]);

  useEffect(() => {
    if (selectedSubCategory) {
      setInternalSubCat(selectedSubCategory);
    }
  }, [selectedSubCategory]);

  const activeTab = activeCategory || internalTab;
  const currentSubCat = selectedSubCategory || internalSubCat;
  const wishlist = wishlistState || localWishlist;

  const handleWishlistToggle = (productId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (onToggleWishlist) {
      onToggleWishlist(productId);
    } else {
      setLocalWishlist((prev) => ({
        ...prev,
        [productId]: !prev[productId],
      }));
    }
  };

  const handleCartAdd = (product: ProductItem, qty = 1, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (onAddToCart) {
      for (let i = 0; i < qty; i++) {
        onAddToCart(product);
      }
    }
    setAddedCartIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedCartIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1800);
  };

  // Switch tabs & reset subcategory filter
  const handleTabSelect = (tabId: string) => {
    setInternalTab(tabId);
    setInternalSubCat("All");
    setIsExpanded(false);
    if (onTabChange) onTabChange(tabId);
    if (onSubCategoryChange) onSubCategoryChange("All");
  };

  // Switch subcategory filter
  const handleSubCatSelect = (sub: string) => {
    setInternalSubCat(sub);
    if (onSubCategoryChange) onSubCategoryChange(sub);
  };

  // Get raw items for current category
  const rawItems = useMemo(() => {
    switch (activeTab) {
      case "all":
        return isExpanded ? ALL_PHYSICAL_PRODUCTS : ALL_PHYSICAL_PRODUCTS.slice(0, 12);
      case "jewellery":
        return JEWELLERY_PRODUCTS;
      case "korean":
        return KOREAN_PRODUCTS;
      case "dresses":
        return DRESSES_PRODUCTS;
      case "materials":
        return MATERIALS_PRODUCTS;
      case "handlooms":
        return HANDLOOM_PRODUCTS;
      case "beauty":
        return BEAUTY_SERVICES;
      default:
        return JEWELLERY_PRODUCTS;
    }
  }, [activeTab, isExpanded]);

  // Available subcategories for filtering
  const availableSubCategories = useMemo(() => {
    if (activeTab === "all") return ["All"];
    if (activeTab === "beauty") {
      return ["All", ...(CATEGORY_SUBCATEGORIES.beauty || [])];
    }
    return ["All", ...(CATEGORY_SUBCATEGORIES[activeTab] || [])];
  }, [activeTab]);

  // Filter items by subcategory
  const filteredItems = useMemo(() => {
    if (currentSubCat === "All") return rawItems;
    if (activeTab === "beauty") {
      return (rawItems as ServiceItem[]).filter(
        (s) => s.subCategory.toLowerCase() === currentSubCat.toLowerCase()
      );
    }
    return (rawItems as ProductItem[]).filter(
      (p) => p.subCategory.toLowerCase() === currentSubCat.toLowerCase()
    );
  }, [rawItems, currentSubCat, activeTab]);

  // Displayed items based on expansion state
  const displayedItems = useMemo(() => {
    if (activeTab === "beauty") {
      return isExpanded ? filteredItems : filteredItems.slice(0, 4);
    }
    if (activeTab === "all") {
      return filteredItems;
    }
    return isExpanded ? filteredItems : filteredItems.slice(0, 8);
  }, [filteredItems, isExpanded, activeTab]);

  // Handle "VIEW ALL PRODUCTS" or "VIEW ALL SERVICES" click
  const handleViewAllToggle = () => {
    if (activeTab === "beauty") {
      setIsExpanded(!isExpanded);
    } else if (activeTab === "all") {
      setIsExpanded(!isExpanded);
    } else {
      // If on a specific product category, clicking "VIEW ALL PRODUCTS" switches to "all" with full product listing
      if (!isExpanded) {
        handleTabSelect("all");
        setIsExpanded(true);
      } else {
        setIsExpanded(false);
      }
    }
  };

  return (
    <section
      id="shop-by-category"
      className="w-full bg-[#FAF7F3] pt-5 sm:pt-8 md:pt-12 pb-12 sm:pb-16 md:pb-20 border-t border-[#EAE2D8]/60 transition-colors"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-8 sm:mb-12">
          {/* Eyebrow with decorative gold lines */}
          <div className="flex items-center gap-2.5 sm:gap-3 mb-2 sm:mb-3">
            <div className="h-[1px] w-8 sm:w-16 bg-gradient-to-r from-transparent via-[#C5A47E]/60 to-[#C5A47E]" />
            <span className="text-[#C5A47E] text-[11px] sm:text-xs font-semibold tracking-[0.26em] uppercase font-sans">
              OUR COLLECTIONS
            </span>
            <div className="h-[1px] w-8 sm:w-16 bg-gradient-to-l from-transparent via-[#C5A47E]/60 to-[#C5A47E]" />
          </div>

          {/* Main Heading */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-normal text-[#231610] tracking-[0.16em] uppercase font-serif-luxury leading-tight">
            SHOP BY CATEGORY
          </h2>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-[#7A6F68] font-cormorant italic mt-1 sm:mt-2">
            Handpicked styles & royal luxury for every occasion
          </p>

          {/* Category Navigation Tabs Bar with Enhanced Touch-Friendliness & Premium Styling */}
          <div className="w-full mt-7 sm:mt-9 overflow-x-auto no-scrollbar scroll-smooth pb-3.5 pt-1 border-b border-[#EAE2D8]">
            <div className="flex items-center justify-start md:justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-10 min-w-max px-3 mx-auto">
              {/* All Collections */}
              <button
                type="button"
                onClick={() => handleTabSelect("all")}
                className={`relative flex items-center gap-2.5 px-3 py-2 sm:px-4 sm:py-2.5 pb-4 text-sm sm:text-[15.5px] md:text-[16px] tracking-[0.03em] transition-all duration-200 focus:outline-none cursor-pointer whitespace-nowrap rounded-lg ${
                  activeTab === "all"
                    ? "text-[#231610] font-bold"
                    : "text-[#7A6F68] hover:text-[#231610] font-normal hover:bg-[#FAF0E4]/40"
                }`}
              >
                <Sparkles
                  className={`w-5 h-5 sm:w-[22px] sm:h-[22px] transition-colors duration-200 ${
                    activeTab === "all"
                      ? "text-[#A57D4E] stroke-[2.2]"
                      : "text-[#9E9085] stroke-[1.5]"
                  }`}
                />
                <span>All Collections</span>
                {activeTab === "all" && (
                  <div className="absolute bottom-0 inset-x-2 h-[3px] bg-gradient-to-r from-[#DFCAAD] via-[#C5A47E] to-[#A57D4E] rounded-full shadow-sm" />
                )}
              </button>

              {/* Jewellery */}
              <button
                type="button"
                onClick={() => handleTabSelect("jewellery")}
                className={`relative flex items-center gap-2.5 px-3 py-2 sm:px-4 sm:py-2.5 pb-4 text-sm sm:text-[15.5px] md:text-[16px] tracking-[0.03em] transition-all duration-200 focus:outline-none cursor-pointer whitespace-nowrap rounded-lg ${
                  activeTab === "jewellery"
                    ? "text-[#231610] font-bold"
                    : "text-[#7A6F68] hover:text-[#231610] font-normal hover:bg-[#FAF0E4]/40"
                }`}
              >
                <Gem
                  className={`w-5 h-5 sm:w-[22px] sm:h-[22px] transition-colors duration-200 ${
                    activeTab === "jewellery"
                      ? "text-[#A57D4E] stroke-[2.2]"
                      : "text-[#9E9085] stroke-[1.5]"
                  }`}
                />
                <span>Jewellery</span>
                {activeTab === "jewellery" && (
                  <div className="absolute bottom-0 inset-x-2 h-[3px] bg-gradient-to-r from-[#DFCAAD] via-[#C5A47E] to-[#A57D4E] rounded-full shadow-sm" />
                )}
              </button>

              {/* Korean Items */}
              <button
                type="button"
                onClick={() => handleTabSelect("korean")}
                className={`relative flex items-center gap-2.5 px-3 py-2 sm:px-4 sm:py-2.5 pb-4 text-sm sm:text-[15.5px] md:text-[16px] tracking-[0.03em] transition-all duration-200 focus:outline-none cursor-pointer whitespace-nowrap rounded-lg ${
                  activeTab === "korean"
                    ? "text-[#231610] font-bold"
                    : "text-[#7A6F68] hover:text-[#231610] font-normal hover:bg-[#FAF0E4]/40"
                }`}
              >
                <BowIcon
                  className={`w-5 h-5 sm:w-[22px] sm:h-[22px] transition-colors duration-200 ${
                    activeTab === "korean"
                      ? "text-[#A57D4E] stroke-[2.2]"
                      : "text-[#9E9085] stroke-[1.5]"
                  }`}
                />
                <span>Korean Items</span>
                {activeTab === "korean" && (
                  <div className="absolute bottom-0 inset-x-2 h-[3px] bg-gradient-to-r from-[#DFCAAD] via-[#C5A47E] to-[#A57D4E] rounded-full shadow-sm" />
                )}
              </button>

              {/* Readymade Dresses */}
              <button
                type="button"
                onClick={() => handleTabSelect("dresses")}
                className={`relative flex items-center gap-2.5 px-3 py-2 sm:px-4 sm:py-2.5 pb-4 text-sm sm:text-[15.5px] md:text-[16px] tracking-[0.03em] transition-all duration-200 focus:outline-none cursor-pointer whitespace-nowrap rounded-lg ${
                  activeTab === "dresses"
                    ? "text-[#231610] font-bold"
                    : "text-[#7A6F68] hover:text-[#231610] font-normal hover:bg-[#FAF0E4]/40"
                }`}
              >
                <Shirt
                  className={`w-5 h-5 sm:w-[22px] sm:h-[22px] transition-colors duration-200 ${
                    activeTab === "dresses"
                      ? "text-[#A57D4E] stroke-[2.2]"
                      : "text-[#9E9085] stroke-[1.5]"
                  }`}
                />
                <span>Readymade Dresses</span>
                {activeTab === "dresses" && (
                  <div className="absolute bottom-0 inset-x-2 h-[3px] bg-gradient-to-r from-[#DFCAAD] via-[#C5A47E] to-[#A57D4E] rounded-full shadow-sm" />
                )}
              </button>

              {/* Dress Materials */}
              <button
                type="button"
                onClick={() => handleTabSelect("materials")}
                className={`relative flex items-center gap-2.5 px-3 py-2 sm:px-4 sm:py-2.5 pb-4 text-sm sm:text-[15.5px] md:text-[16px] tracking-[0.03em] transition-all duration-200 focus:outline-none cursor-pointer whitespace-nowrap rounded-lg ${
                  activeTab === "materials"
                    ? "text-[#231610] font-bold"
                    : "text-[#7A6F68] hover:text-[#231610] font-normal hover:bg-[#FAF0E4]/40"
                }`}
              >
                <Layers
                  className={`w-5 h-5 sm:w-[22px] sm:h-[22px] transition-colors duration-200 ${
                    activeTab === "materials"
                      ? "text-[#A57D4E] stroke-[2.2]"
                      : "text-[#9E9085] stroke-[1.5]"
                  }`}
                />
                <span>Dress Materials</span>
                {activeTab === "materials" && (
                  <div className="absolute bottom-0 inset-x-2 h-[3px] bg-gradient-to-r from-[#DFCAAD] via-[#C5A47E] to-[#A57D4E] rounded-full shadow-sm" />
                )}
              </button>

              {/* Handlooms */}
              <button
                type="button"
                onClick={() => handleTabSelect("handlooms")}
                className={`relative flex items-center gap-2.5 px-3 py-2 sm:px-4 sm:py-2.5 pb-4 text-sm sm:text-[15.5px] md:text-[16px] tracking-[0.03em] transition-all duration-200 focus:outline-none cursor-pointer whitespace-nowrap rounded-lg ${
                  activeTab === "handlooms"
                    ? "text-[#231610] font-bold"
                    : "text-[#7A6F68] hover:text-[#231610] font-normal hover:bg-[#FAF0E4]/40"
                }`}
              >
                <GridIcon
                  className={`w-5 h-5 sm:w-[22px] sm:h-[22px] transition-colors duration-200 ${
                    activeTab === "handlooms"
                      ? "text-[#A57D4E] stroke-[2.2]"
                      : "text-[#9E9085] stroke-[1.5]"
                  }`}
                />
                <span>Handlooms</span>
                {activeTab === "handlooms" && (
                  <div className="absolute bottom-0 inset-x-2 h-[3px] bg-gradient-to-r from-[#DFCAAD] via-[#C5A47E] to-[#A57D4E] rounded-full shadow-sm" />
                )}
              </button>

              {/* Beauty & Salon */}
              <button
                type="button"
                onClick={() => handleTabSelect("beauty")}
                className={`relative flex items-center gap-2.5 px-3 py-2 sm:px-4 sm:py-2.5 pb-4 text-sm sm:text-[15.5px] md:text-[16px] tracking-[0.03em] transition-all duration-200 focus:outline-none cursor-pointer whitespace-nowrap rounded-lg ${
                  activeTab === "beauty"
                    ? "text-[#231610] font-bold"
                    : "text-[#7A6F68] hover:text-[#231610] font-normal hover:bg-[#FAF0E4]/40"
                }`}
              >
                <Flower2
                  className={`w-5 h-5 sm:w-[22px] sm:h-[22px] transition-colors duration-200 ${
                    activeTab === "beauty"
                      ? "text-[#A57D4E] stroke-[2.2]"
                      : "text-[#9E9085] stroke-[1.5]"
                  }`}
                />
                <span>Beauty & Salon</span>
                {activeTab === "beauty" && (
                  <div className="absolute bottom-0 inset-x-2 h-[3px] bg-gradient-to-r from-[#DFCAAD] via-[#C5A47E] to-[#A57D4E] rounded-full shadow-sm" />
                )}
              </button>
            </div>
          </div>

          {/* Sub-Category Filter Pill Tags */}
          {availableSubCategories.length > 1 && (
            <div className="flex items-center gap-2 mt-5 overflow-x-auto no-scrollbar max-w-full px-2 py-1">
              <span className="text-[11px] font-semibold text-[#8C7E75] uppercase tracking-wider flex items-center gap-1 mr-1.5 flex-shrink-0">
                <Filter className="w-3.5 h-3.5 text-[#C5A47E]" />
                FILTER:
              </span>
              {availableSubCategories.map((sub) => {
                const isSelected =
                  currentSubCat.toLowerCase() === sub.toLowerCase();
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => handleSubCatSelect(sub)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 cursor-pointer ${
                      isSelected
                        ? "bg-[#231610] text-[#FAF7F3] shadow-sm font-semibold"
                        : "bg-white text-[#6B5E55] hover:bg-[#EAE2D8]/60 border border-[#EAE2D8]"
                    }`}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Content Grid: Dedicated Beauty & Salon Services Grid OR Products Grid */}
        {activeTab === "beauty" ? (
          /* Beauty & Salon Services Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {(displayedItems as ServiceItem[]).map((service) => (
              <div
                key={service.id}
                className="group relative flex flex-col bg-white rounded-xl sm:rounded-2xl border border-[#EAE2D8] overflow-hidden transition-all duration-300 shadow-[0_2px_12px_rgba(35,22,16,0.03)] hover:shadow-[0_14px_36px_rgba(35,22,16,0.09)] hover:border-[#C5A47E]/60"
              >
                {/* Service Image Container */}
                <div className="relative w-full aspect-[4/3] bg-[#F5ECE5] overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.name}
                    fill
                    className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />

                  {/* Top-Left Ribbon Tag Badge */}
                  <div className="absolute top-2.5 left-0 z-10">
                    <span
                      className={`inline-block px-2.5 py-1 text-[9px] sm:text-[10px] font-bold tracking-wider uppercase rounded-r-md shadow-sm text-white ${
                        service.badge.type === "maroon"
                          ? "bg-[#6A1A24]"
                          : "bg-[#A57D4E]"
                      }`}
                    >
                      {service.badge.text}
                    </span>
                  </div>

                  {/* Bottom-Right Duration Pill */}
                  <div className="absolute bottom-2.5 right-2.5 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-md border border-[#EAE2D8] text-[#231610] text-[10px] sm:text-[11px] font-semibold shadow-sm">
                    <Clock className="w-3.5 h-3.5 text-[#C5A47E]" />
                    <span>{service.duration}</span>
                  </div>
                </div>

                {/* Service Card Content */}
                <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 bg-white">
                  <div>
                    {/* Subcategory Label */}
                    <span className="text-[10px] sm:text-[11px] font-semibold text-[#A57D4E] tracking-wider uppercase font-sans">
                      {service.subCategory}
                    </span>

                    {/* Service Name */}
                    <h3 className="text-sm sm:text-base font-normal text-[#231610] font-serif-luxury tracking-wide line-clamp-2 mt-0.5 group-hover:text-[#A57D4E] transition-colors uppercase leading-snug">
                      {service.name}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-[#6B5E55] line-clamp-2 mt-1 leading-relaxed font-normal">
                      {service.description}
                    </p>

                    {/* Bullet Benefits */}
                    <div className="mt-2.5 pt-2 border-t border-[#F2ECE4] space-y-1">
                      {service.benefits.map((b, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-[11px] sm:text-[11.5px] text-[#7A6F68]"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C5A47E] flex-shrink-0" />
                          <span className="truncate">{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Starting Price & Book Slot Action Button */}
                  <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-[#F2ECE4]">
                    <div>
                      <span className="text-[9px] sm:text-[9.5px] text-[#9E9085] uppercase tracking-wider block font-medium">
                        STARTING FROM
                      </span>
                      <span className="text-base sm:text-lg font-bold text-[#231610] font-sans">
                        ₹{service.price.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setAppointmentService(service)}
                      className="px-3.5 py-2 rounded-lg bg-[#FAF7F3] hover:bg-[#231610] text-[#231610] hover:text-[#FAF7F3] border border-[#C5A47E] text-[10.5px] sm:text-[11px] font-semibold tracking-wider uppercase transition-all shadow-sm hover:shadow flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Calendar className="w-3.5 h-3.5 text-[#C5A47E]" />
                      <span>BOOK SLOT</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5 md:gap-6 lg:gap-7">
            {(displayedItems as ProductItem[]).map((product) => {
              const isWishlisted = !!wishlist[product.id];
              const isAdded = !!addedCartIds[product.id];

              return (
                <div
                  key={product.id}
                  className="group relative flex flex-col bg-white rounded-xl sm:rounded-2xl border border-[#EAE2D8] overflow-hidden transition-all duration-300 shadow-[0_2px_12px_rgba(35,22,16,0.03)] hover:shadow-[0_14px_36px_rgba(35,22,16,0.09)] hover:border-[#C5A47E]/60"
                >
                  {/* Product Image Container */}
                  <div className="relative w-full aspect-square bg-[#F5ECE5] overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      quality={95}
                      className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />

                    {/* Top-Left Ribbon Badge */}
                    <div className="absolute top-2.5 left-0 z-10">
                      <span
                        className={`inline-block px-2.5 py-1 text-[9px] sm:text-[10px] font-bold tracking-wider uppercase rounded-r-md shadow-sm text-white ${
                          product.badge.type === "maroon"
                            ? "bg-[#6A1A24]"
                            : "bg-[#A57D4E]"
                        }`}
                      >
                        {product.badge.text}
                      </span>
                    </div>

                    {/* Top-Right Wishlist Button */}
                    <button
                      type="button"
                      onClick={(e) => handleWishlistToggle(product.id, e)}
                      aria-label={
                        isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                      }
                      className={`absolute top-2.5 right-2.5 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm focus:outline-none cursor-pointer ${
                        isWishlisted
                          ? "bg-[#6A1A24] text-white border-transparent scale-105"
                          : "bg-white/90 backdrop-blur-md text-[#231610] hover:text-[#C5A47E] hover:bg-white border border-[#EAE2D8]"
                      }`}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 ${
                          isWishlisted ? "fill-current scale-110" : ""
                        }`}
                      />
                    </button>

                    {/* Bottom-Left Rating Pill */}
                    <div className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/95 backdrop-blur-md border border-[#EAE2D8] text-[#231610] text-[10px] sm:text-[11px] font-semibold shadow-sm">
                      <span className="text-[#D97706] text-[11px] leading-none">
                        ★
                      </span>
                      <span>{product.rating}</span>
                    </div>

                    {/* Quick View Hover Button */}
                    <button
                      type="button"
                      onClick={() => setQuickViewProduct(product)}
                      className="absolute inset-x-3 bottom-2.5 z-10 hidden group-hover:flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[#231610]/85 backdrop-blur-md text-[#FAF7F3] text-xs font-medium tracking-wide uppercase transition-all duration-200 shadow-md hover:bg-[#231610] cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Quick View</span>
                    </button>
                  </div>

                  {/* Card Info & Pricing */}
                  <div className="p-3.5 sm:p-4 md:p-4.5 flex flex-col justify-between flex-1 bg-white">
                    <div>
                      {/* Name */}
                      <h3
                        onClick={() => setQuickViewProduct(product)}
                        className="text-xs sm:text-sm md:text-[14.5px] font-normal text-[#231610] font-serif-luxury tracking-wide line-clamp-1 leading-snug group-hover:text-[#A57D4E] transition-colors duration-200 cursor-pointer"
                      >
                        {product.name}
                      </h3>

                      {/* Subcategory */}
                      <p className="text-[11px] sm:text-xs text-[#A57D4E] font-medium mt-0.5 sm:mt-1">
                        {product.subCategory}
                      </p>
                    </div>

                    {/* Price & Cart Action */}
                    <div className="flex items-center justify-between pt-2.5 sm:pt-3 mt-2 border-t border-[#F2ECE4]">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm sm:text-base md:text-[17px] font-bold text-[#231610] font-sans tracking-tight">
                          ₹{product.price.toLocaleString("en-IN")}
                        </span>
                        {product.originalPrice && (
                          <span className="text-[11px] sm:text-xs text-[#9E948B] line-through font-normal">
                            ₹{product.originalPrice.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleCartAdd(product, 1, e)}
                        aria-label={`Add ${product.name} to bag`}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center transition-all duration-200 focus:outline-none active:scale-95 shadow-sm cursor-pointer ${
                          isAdded
                            ? "bg-[#231610] text-[#FAF7F3] border-[#231610]"
                            : "border-[#C5A47E]/60 bg-[#FAF7F3] hover:bg-[#C5A47E] text-[#9C7A50] hover:text-white"
                        }`}
                      >
                        {isAdded ? (
                          <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
                        ) : (
                          <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[1.5]" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View All Action Button */}
        <div className="flex items-center justify-center mt-10 sm:mt-14 md:mt-16">
          <div className="flex items-center gap-3 sm:gap-4 w-full max-w-[550px] justify-center">
            {/* Left flourish */}
            <div className="flex items-center gap-1.5 flex-1 justify-end">
              <div className="h-[1px] w-10 sm:w-20 bg-gradient-to-r from-transparent to-[#C5A47E]" />
              <span className="text-[#C5A47E] text-xs select-none">✧</span>
            </div>

            {/* Functional View All Button */}
            <button
              type="button"
              onClick={handleViewAllToggle}
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-9 py-3 sm:py-3.5 rounded-lg border border-[#C5A47E] bg-[#FAF7F3] hover:bg-[#231610] text-[#231610] hover:text-[#FAF7F3] text-xs sm:text-[13px] font-semibold tracking-[0.18em] uppercase font-sans transition-all duration-300 shadow-sm hover:shadow-md group/btn whitespace-nowrap cursor-pointer"
            >
              <span>
                {activeTab === "beauty"
                  ? isExpanded
                    ? "SHOW FEATURED SERVICES"
                    : "VIEW ALL SERVICES"
                  : activeTab === "all"
                  ? isExpanded
                    ? "SHOW FEATURED ONLY"
                    : "VIEW ALL PRODUCTS"
                  : "VIEW ALL PRODUCTS"}
              </span>
              <ArrowRight
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 ${
                  isExpanded && (activeTab === "beauty" || activeTab === "all")
                    ? "rotate-90"
                    : "group-hover/btn:translate-x-1"
                }`}
              />
            </button>

            {/* Right flourish */}
            <div className="flex items-center gap-1.5 flex-1 justify-start">
              <span className="text-[#C5A47E] text-xs select-none">✧</span>
              <div className="h-[1px] w-10 sm:w-20 bg-gradient-to-l from-transparent to-[#C5A47E]" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick View Product Modal */}
      <ProductQuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleCartAdd}
        isWishlisted={
          quickViewProduct ? !!wishlist[quickViewProduct.id] : false
        }
        onToggleWishlist={handleWishlistToggle}
      />

      {/* Salon Appointment Booking Modal */}
      <AppointmentModal
        service={appointmentService}
        isOpen={!!appointmentService}
        onClose={() => setAppointmentService(null)}
      />
    </section>
  );
}
