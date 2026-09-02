"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  ShoppingCart,
  Sparkles,
  Gem,
  Scissors,
  Shirt,
  Layers,
  Grid,
  Flower2,
  ArrowRight,
  Check,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  categorySlug: string;
  price: number;
  originalPrice?: number;
  rating: number;
  badge: {
    text: string;
    type: "maroon" | "gold";
  };
  image: string;
}

const CATEGORY_TABS = [
  { id: "all", label: "All", icon: Sparkles },
  { id: "jewellery", label: "Jewellery", icon: Gem },
  { id: "korean", label: "Korean Items", icon: Scissors },
  { id: "dresses", label: "Readymade Dresses", icon: Shirt },
  { id: "materials", label: "Dress Materials", icon: Layers },
  { id: "handlooms", label: "Handlooms", icon: Grid },
  { id: "beauty", label: "Beauty & Salon", icon: Flower2 },
];

const JEWELLERY_PRODUCTS: Product[] = [
  {
    id: "jewel-1",
    name: "Dazzling Kundan Pearl Necklace Set",
    category: "Jewellery",
    categorySlug: "jewellery",
    price: 2499,
    rating: 4.4,
    badge: {
      text: "BUY 2 @ 20% OFF",
      type: "maroon",
    },
    image: "/images/prod-kundan-necklace.jpg",
  },
  {
    id: "jewel-2",
    name: "Elegant Kundan Bangles",
    category: "Jewellery",
    categorySlug: "jewellery",
    price: 1299,
    originalPrice: 1799,
    rating: 4.2,
    badge: {
      text: "BUY 1 GET 1",
      type: "gold",
    },
    image: "/images/prod-kundan-bangles.jpg",
  },
  {
    id: "jewel-3",
    name: "Traditional Kundan Jhumka Earrings",
    category: "Jewellery",
    categorySlug: "jewellery",
    price: 1599,
    originalPrice: 1999,
    rating: 4.3,
    badge: {
      text: "BUY 2 @ 20% OFF",
      type: "maroon",
    },
    image: "/images/prod-kundan-jhumkas.jpg",
  },
  {
    id: "jewel-4",
    name: "Demi Fine Pearl Pendant Necklace",
    category: "Jewellery",
    categorySlug: "jewellery",
    price: 899,
    originalPrice: 1299,
    rating: 4.1,
    badge: {
      text: "BUY 1 GET 1",
      type: "gold",
    },
    image: "/images/prod-pearl-pendant.jpg",
  },
];

export default function JewellerySection() {
  const [activeTab, setActiveTab] = useState("jewellery");
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [addedCart, setAddedCart] = useState<Record<string, boolean>>({});

  const toggleWishlist = (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const handleAddToCart = (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAddedCart((prev) => ({
      ...prev,
      [productId]: true,
    }));
    setTimeout(() => {
      setAddedCart((prev) => ({
        ...prev,
        [productId]: false,
      }));
    }, 1800);
  };

  const displayedProducts =
    activeTab === "all" || activeTab === "jewellery"
      ? JEWELLERY_PRODUCTS
      : JEWELLERY_PRODUCTS;

  return (
    <section id="jewellery-collection" className="w-full bg-[#FAF7F3] py-12 sm:py-16 md:py-20 border-t border-[#EAE2D8]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-8 sm:mb-12">
          {/* Eyebrow with decorative gold lines */}
          <div className="flex items-center gap-2.5 sm:gap-3 mb-2 sm:mb-3">
            <div className="h-[1px] w-8 sm:w-14 bg-gradient-to-r from-transparent to-[#C5A47E]" />
            <span className="text-[#C5A47E] text-[10px] sm:text-xs font-semibold tracking-[0.24em] uppercase font-sans">
              OUR COLLECTIONS
            </span>
            <div className="h-[1px] w-8 sm:w-14 bg-gradient-to-l from-transparent to-[#C5A47E]" />
          </div>

          {/* Main Heading */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-normal text-[#231610] tracking-[0.14em] uppercase font-serif-luxury leading-tight">
            SHOP BY CATEGORY
          </h2>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-[#7A6F68] font-cormorant italic mt-1.5">
            Handpicked styles for every occasion
          </p>

          {/* Category Filter Navigation Tabs Bar */}
          <div className="w-full mt-6 sm:mt-8 overflow-x-auto no-scrollbar scroll-smooth pb-2 pt-1 border-b border-[#EAE2D8]">
            <div className="flex items-center justify-start md:justify-center gap-6 sm:gap-8 md:gap-10 min-w-max px-2">
              {CATEGORY_TABS.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2 pb-3.5 text-xs sm:text-sm tracking-wide transition-all duration-200 focus:outline-none cursor-pointer whitespace-nowrap ${
                      isActive
                        ? "text-[#231610] font-semibold"
                        : "text-[#7A6F68] hover:text-[#231610] font-normal"
                    }`}
                  >
                    <IconComponent
                      className={`w-4 h-4 sm:w-[18px] sm:h-[18px] transition-colors ${
                        isActive ? "text-[#C5A47E]" : "text-[#A89D95]"
                      }`}
                    />
                    <span>{tab.label}</span>

                    {/* Active Tab Gold Underline Bar */}
                    {isActive && (
                      <div className="absolute bottom-0 inset-x-0 h-[2px] bg-[#C5A47E] rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4-Column Product Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5 md:gap-6 lg:gap-7">
          {displayedProducts.map((product) => {
            const isWishlisted = !!wishlist[product.id];
            const isAdded = !!addedCart[product.id];

            return (
              <div
                key={product.id}
                className="group relative flex flex-col bg-white rounded-xl sm:rounded-2xl border border-[#EAE2D8] overflow-hidden transition-all duration-300 shadow-[0_2px_12px_rgba(35,22,16,0.03)] hover:shadow-[0_12px_32px_rgba(35,22,16,0.08)] hover:border-[#C5A47E]/60"
              >
                {/* Product Image Aspect Container */}
                <div className="relative w-full aspect-square bg-[#F5ECE5] overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    quality={95}
                    className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 320px"
                  />

                  {/* Top-Left Offer Ribbon Badge */}
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

                  {/* Top-Right Wishlist Heart Button */}
                  <button
                    type="button"
                    onClick={(e) => toggleWishlist(product.id, e)}
                    aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    className={`absolute top-2.5 right-2.5 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm focus:outline-none ${
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
                    <span className="text-[#D97706] text-[11px] leading-none">★</span>
                    <span>{product.rating}</span>
                  </div>
                </div>

                {/* Product Info & Price Area */}
                <div className="p-3 sm:p-4 md:p-4.5 flex flex-col justify-between flex-1 bg-white">
                  <div>
                    {/* Product Name */}
                    <h3 className="text-xs sm:text-sm md:text-[14.5px] font-normal text-[#231610] font-serif-luxury tracking-wide line-clamp-1 leading-snug group-hover:text-[#A57D4E] transition-colors duration-200">
                      {product.name}
                    </h3>

                    {/* Category */}
                    <p className="text-[11px] sm:text-xs text-[#A57D4E] font-medium mt-0.5 sm:mt-1">
                      {product.category}
                    </p>
                  </div>

                  {/* Price and Cart Button Row */}
                  <div className="flex items-center justify-between pt-2.5 sm:pt-3 mt-1.5 border-t border-[#F2ECE4]">
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

                    {/* Add to Cart Button */}
                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(product.id, e)}
                      aria-label={`Add ${product.name} to cart`}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center transition-all duration-200 focus:outline-none active:scale-95 shadow-sm ${
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

        {/* View All Jewellery Action */}
        <div className="flex items-center justify-center mt-10 sm:mt-14">
          <div className="flex items-center gap-3 sm:gap-4 w-full max-w-[500px] justify-center">
            {/* Left Decorative flourish */}
            <div className="flex items-center gap-1.5 flex-1 justify-end">
              <div className="h-[1px] w-10 sm:w-16 bg-gradient-to-r from-transparent to-[#C5A47E]" />
              <span className="text-[#C5A47E] text-xs select-none">✧</span>
            </div>

            {/* View All Button */}
            <Link
              href="/#anti-tarnish"
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 rounded-lg border border-[#C5A47E] bg-[#FAF7F3] hover:bg-[#231610] text-[#231610] hover:text-[#FAF7F3] text-xs sm:text-[13px] font-semibold tracking-[0.16em] uppercase font-sans transition-all duration-300 shadow-sm hover:shadow-md group/btn whitespace-nowrap"
            >
              <span>VIEW ALL JEWELLERY</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
            </Link>

            {/* Right Decorative flourish */}
            <div className="flex items-center gap-1.5 flex-1 justify-start">
              <span className="text-[#C5A47E] text-xs select-none">✧</span>
              <div className="h-[1px] w-10 sm:w-16 bg-gradient-to-l from-transparent to-[#C5A47E]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
