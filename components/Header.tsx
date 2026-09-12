"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, User, Heart, ShoppingBag, Menu } from "lucide-react";
import SidebarMenu from "./SidebarMenu";

interface HeaderProps {
  wishlistCount?: number;
  cartCount?: number;
  onOpenWishlist?: () => void;
  onOpenCart?: () => void;
  onOpenSearch?: () => void;
  onSelectCategory?: (categoryId: string, subCategory?: string) => void;
  onOpenStoreLocator?: () => void;
  onOpenAboutUs?: () => void;
  onOpenContactUs?: () => void;
}

export default function Header({
  wishlistCount = 0,
  cartCount = 0,
  onOpenWishlist,
  onOpenCart,
  onOpenSearch,
  onSelectCategory,
  onOpenStoreLocator,
  onOpenAboutUs,
  onOpenContactUs,
}: HeaderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleCategorySelect = (categoryId: string, subCategory?: string) => {
    if (onSelectCategory) {
      onSelectCategory(categoryId, subCategory);
    }
  };

  return (
    <>
      <header className="w-full bg-[#FAF7F3]/95 backdrop-blur-md sticky top-0 z-50 transition-all duration-200 border-b border-[#EAE2D8]/80 shadow-[0_2px_12px_rgba(35,22,16,0.04)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 h-20 sm:h-24 flex items-center justify-between relative">
          {/* Left: Hamburger Menu Button */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="text-[#231610] hover:text-[#B89366] p-2 -ml-2 transition-colors duration-200 focus:outline-none cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-6 h-6 stroke-[1.4]" />
            </button>
          </div>

          {/* Center: Insha Collections Logo */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-auto">
            <Link href="/" className="flex flex-col items-center group py-1">
              <div className="relative w-[115px] sm:w-[130px] md:w-[140px] h-[72px] sm:h-[82px] md:h-[88px] transition-transform duration-300 group-hover:scale-[1.02]">
                <Image
                  src="/images/New-logo.jpeg"
                  alt="Insha Collections - Timeless • Elegant • You"
                  fill
                  priority
                  className="object-contain mix-blend-multiply"
                  sizes="(max-width: 640px) 115px, (max-width: 768px) 130px, 140px"
                />
              </div>
            </Link>
          </div>

          {/* Right: Interface Action Icons (Search, User/Login, Cart) */}
          <div className="flex items-center gap-2 sm:gap-4 md:gap-5 lg:gap-6 text-[#231610]">
            {/* Search Icon */}
            <button
              type="button"
              onClick={() => {
                if (onOpenSearch) {
                  onOpenSearch();
                } else {
                  if (onSelectCategory) {
                    onSelectCategory("all", "All");
                  }
                  const elem = document.getElementById("shop-by-category");
                  if (elem) elem.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="hover:text-[#B89366] transition-colors duration-200 p-1 sm:p-1.5 focus:outline-none cursor-pointer"
              aria-label="Search collection"
            >
              <Search className="w-5 h-5 sm:w-[22px] sm:h-[22px] stroke-[1.35]" />
            </button>

            {/* User / Login Account Icon */}
            <Link
              href="/login"
              className="hover:text-[#B89366] transition-colors duration-200 p-1 sm:p-1.5 focus:outline-none cursor-pointer flex items-center justify-center"
              aria-label="Admin / User Login"
              title="Admin / Account Login"
            >
              <User className="w-5 h-5 sm:w-[22px] sm:h-[22px] stroke-[1.35]" />
            </Link>

            {/* Shopping Bag Icon with Badge */}
            <button
              type="button"
              onClick={onOpenCart}
              className="hover:text-[#B89366] transition-colors duration-200 p-1 sm:p-1.5 relative focus:outline-none cursor-pointer"
              aria-label={`Shopping bag with ${cartCount} items`}
            >
              <ShoppingBag className="w-5 h-5 sm:w-[22px] sm:h-[22px] stroke-[1.35]" />
              <span className="absolute top-0 right-0 w-4 h-4 bg-[#231610] text-[#FAF7F3] text-[9.5px] font-bold rounded-full flex items-center justify-center leading-none">
                {cartCount}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Full Royal Sidebar Menu matching reference */}
      <SidebarMenu
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelectCategory={handleCategorySelect}
        onOpenWishlist={() => {
          if (onOpenWishlist) onOpenWishlist();
        }}
        onOpenStoreLocator={() => {
          if (onOpenStoreLocator) onOpenStoreLocator();
        }}
        onOpenAboutUs={() => {
          if (onOpenAboutUs) onOpenAboutUs();
        }}
        onOpenContactUs={() => {
          if (onOpenContactUs) onOpenContactUs();
        }}
      />
    </>
  );
}

