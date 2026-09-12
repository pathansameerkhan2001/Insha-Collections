"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { Search, X, Sparkles, ArrowRight, Eye, Tag } from "lucide-react";
import { ProductItem } from "@/data/catalog";
import { prefetchQuickViewImage, isS3DeliveryUrl, LUXURY_BLUR_DATA_URL } from "@/lib/products/productTypes";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductItem[];
  onSelectProduct: (product: ProductItem) => void;
}

const POPULAR_SEARCH_TAGS = [
  "Bangles",
  "Kundan",
  "Korean",
  "Handloom",
  "Bridal",
  "Earrings",
  "Necklace",
  "Silk",
];

export default function SearchModal({
  isOpen,
  onClose,
  products,
  onSelectProduct,
}: SearchModalProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus search input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Filtered search results with multi-attribute search matching
  const searchResults = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];

    return products.filter((p) => {
      const nameMatch = p.name.toLowerCase().includes(trimmed);
      const catMatch = p.category.toLowerCase().includes(trimmed);
      const subCatMatch = (p.subCategory || "").toLowerCase().includes(trimmed);
      const descMatch = (p.description || "").toLowerCase().includes(trimmed);
      const matMatch = (p.material || "").toLowerCase().includes(trimmed);
      const detailsMatch = p.details
        ? p.details.some((d) => d.toLowerCase().includes(trimmed))
        : false;

      return nameMatch || catMatch || subCatMatch || descMatch || matMatch || detailsMatch;
    });
  }, [query, products]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 md:p-10 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 select-none overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#FAF7F3] rounded-2xl border border-[#DFCAAD] shadow-2xl overflow-hidden mt-6 sm:mt-12 text-[#231610] animate-in slide-in-from-top-4 duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Bar */}
        <div className="p-4 sm:p-6 border-b border-[#EAE2D8] bg-white">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-[#BA7442] absolute left-3.5 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search jewellery, korean items, handlooms, dresses..."
              className="w-full pl-11 pr-10 py-3 rounded-xl bg-[#FAF7F3] border border-[#EAE2D8] focus:border-[#BA7442] focus:ring-2 focus:ring-[#C5A47E]/30 text-sm sm:text-base text-[#231610] placeholder-[#8C7E75] focus:outline-none transition-all font-sans"
              aria-label="Search Insha Collections catalog"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 p-1 rounded-full text-[#8C7E75] hover:text-[#231610] hover:bg-[#EAE2D8]/60 transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filter Tags */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-0.5 scrollbar-none">
            <span className="text-[11px] font-semibold text-[#8C7E75] uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Tag className="w-3 h-3 text-[#C5A47E]" />
              Popular:
            </span>
            {POPULAR_SEARCH_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setQuery(tag)}
                className={`px-2.5 py-1 rounded-full text-xs transition-colors shrink-0 cursor-pointer ${
                  query.toLowerCase() === tag.toLowerCase()
                    ? "bg-[#231610] text-[#FAF7F3]"
                    : "bg-[#FAF0E4] hover:bg-[#EAE2D8] text-[#5A4D45] border border-[#E8D4C1]"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6 space-y-3">
          {query.trim() === "" ? (
            <div className="py-10 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#FAF0E4] border border-[#C5A47E]/50 flex items-center justify-center text-[#BA7442] mx-auto mb-3">
                <Sparkles className="w-6 h-6 stroke-[1.4]" />
              </div>
              <h4 className="text-sm sm:text-base font-normal text-[#231610] font-serif-luxury tracking-wide">
                DISCOVER OUR ROYAL COLLECTIONS
              </h4>
              <p className="text-xs text-[#7A6F68] max-w-sm mx-auto font-cormorant italic">
                Search through our catalog of anti-tarnish jewellery, Korean accessories, handloom silks, and designer wear.
              </p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <p className="text-sm font-semibold text-[#231610]">No matching products found</p>
              <p className="text-xs text-[#7A6F68]">
                We couldn&apos;t find anything matching &ldquo;{query}&rdquo;. Try searching for &ldquo;bangles&rdquo;, &ldquo;kundan&rdquo;, &ldquo;korean&rdquo;, or &ldquo;handloom&rdquo;.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between pb-2 border-b border-[#EAE2D8] text-xs text-[#7A6F68]">
                <span>
                  Found <strong className="text-[#231610]">{searchResults.length}</strong> matching item
                  {searchResults.length === 1 ? "" : "s"}
                </span>
                <span className="text-[11px] uppercase tracking-wider text-[#A57D4E] font-semibold">
                  Click to view
                </span>
              </div>

              <div className="space-y-2.5">
                {searchResults.map((product) => (
                  <div
                    key={product.id}
                    onMouseEnter={() => prefetchQuickViewImage(product)}
                    onClick={() => {
                      onSelectProduct(product);
                      onClose();
                    }}
                    className="group flex items-center justify-between p-3 rounded-xl bg-white hover:bg-[#FAF0E4] border border-[#EAE2D8] hover:border-[#C5A47E] transition-all duration-200 shadow-xs cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      {/* Product Thumbnail */}
                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-[#F5ECE5] overflow-hidden shrink-0 border border-[#EAE2D8]">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="64px"
                          quality={75}
                          unoptimized={isS3DeliveryUrl(product.image)}
                          placeholder="blur"
                          blurDataURL={LUXURY_BLUR_DATA_URL}
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Product Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] sm:text-[10.5px] font-bold text-[#A57D4E] uppercase tracking-wider">
                            {product.subCategory || product.category}
                          </span>
                          {product.badge && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-[#6A1A24]/10 text-[#6A1A24]">
                              {product.badge.text}
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs sm:text-sm font-semibold text-[#231610] group-hover:text-[#BA7442] transition-colors line-clamp-1 leading-snug mt-0.5">
                          {product.name}
                        </h4>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-xs sm:text-sm font-bold text-[#231610] font-sans">
                            ₹{product.price.toLocaleString("en-IN")}
                          </span>
                          {product.originalPrice && (
                            <span className="text-[11px] text-[#9E948B] line-through font-normal">
                              ₹{product.originalPrice.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#BA7442] group-hover:translate-x-1 transition-transform">
                      <span className="hidden sm:inline">Quick View</span>
                      <Eye className="w-4 h-4 sm:hidden" />
                      <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-[#F5ECE5]/60 border-t border-[#EAE2D8] flex items-center justify-between text-xs text-[#7A6F68]">
          <span className="font-cormorant italic text-sm text-[#5A4D45]">
            Insha Collections • Premium Luxury Experience
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-white hover:bg-[#231610] text-[#231610] hover:text-white border border-[#EAE2D8] transition-colors text-xs font-medium cursor-pointer"
          >
            Close (Esc)
          </button>
        </div>
      </div>
    </div>
  );
}
