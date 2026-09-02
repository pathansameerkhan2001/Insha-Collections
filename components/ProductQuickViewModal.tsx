"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, Heart, ShoppingCart, Star, ShieldCheck, Truck, RotateCcw, Check } from "lucide-react";
import { ProductItem } from "@/data/catalog";

interface ProductQuickViewModalProps {
  product: ProductItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: ProductItem, qty: number) => void;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
}

export default function ProductQuickViewModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
}: ProductQuickViewModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  if (!isOpen || !product) return null;

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#FAF7F3] rounded-2xl border border-[#C5A47E]/40 shadow-2xl p-5 sm:p-7 md:p-8 text-[#231610]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-[#231610] text-[#231610] hover:text-white border border-[#EAE2D8] flex items-center justify-center transition-colors shadow-sm focus:outline-none"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 stroke-[1.5]" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
          {/* Left: Product Image */}
          <div className="relative w-full aspect-square bg-[#F5ECE5] rounded-xl overflow-hidden border border-[#EAE2D8]">
            <Image
              src={product.image}
              alt={product.name}
              fill
              quality={95}
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 450px"
            />

            {/* Badge */}
            <div className="absolute top-3 left-3 z-10">
              <span
                className={`inline-block px-3 py-1 text-[10px] font-bold tracking-wider uppercase rounded-md shadow-sm text-white ${
                  product.badge.type === "maroon" ? "bg-[#6A1A24]" : "bg-[#A57D4E]"
                }`}
              >
                {product.badge.text}
              </span>
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="flex flex-col justify-between space-y-4">
            <div>
              {/* Category Eyebrow */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#A57D4E] font-semibold tracking-wider uppercase">
                  {product.subCategory}
                </span>
                <div className="flex items-center gap-1 text-xs text-[#231610] font-semibold bg-white px-2 py-0.5 rounded border border-[#EAE2D8]">
                  <Star className="w-3.5 h-3.5 fill-[#D97706] text-[#D97706]" />
                  <span>{product.rating}</span>
                  <span className="text-[#9E9085] font-normal">({product.reviewsCount})</span>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-lg sm:text-xl md:text-2xl font-normal text-[#231610] font-serif-luxury tracking-wide mt-1.5 leading-snug">
                {product.name}
              </h2>

              {/* Pricing */}
              <div className="flex items-baseline gap-2.5 mt-3">
                <span className="text-xl sm:text-2xl font-bold text-[#231610] font-sans">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-[#9E9085] line-through">
                    ₹{product.originalPrice.toLocaleString("en-IN")}
                  </span>
                )}
                {product.originalPrice && (
                  <span className="text-xs font-semibold text-[#6A1A24] bg-[#6A1A24]/10 px-2 py-0.5 rounded">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-[#6B5E55] font-normal mt-3 leading-relaxed">
                {product.description}
              </p>

              {/* Specs / Features */}
              {product.details && (
                <div className="mt-4 pt-3 border-t border-[#EAE2D8]/80">
                  <span className="text-[11px] font-semibold text-[#231610] uppercase tracking-wider block mb-1.5">
                    Highlights
                  </span>
                  <ul className="space-y-1">
                    {product.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-[#6B5E55]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C5A47E]" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Actions: Quantity + Add to Cart + Wishlist */}
            <div className="pt-4 border-t border-[#EAE2D8] space-y-3">
              <div className="flex items-center gap-3">
                {/* Quantity Controls */}
                <div className="flex items-center border border-[#C5A47E]/60 rounded-lg bg-white overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-sm font-semibold text-[#231610] hover:bg-[#FAF7F3] transition-colors"
                  >
                    -
                  </button>
                  <span className="px-3 py-2 text-xs font-bold text-[#231610] min-w-[28px] text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-sm font-semibold text-[#231610] hover:bg-[#FAF7F3] transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  type="button"
                  onClick={handleAdd}
                  className={`flex-1 py-3 px-5 rounded-lg flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all duration-200 shadow-sm ${
                    isAdded
                      ? "bg-[#231610] text-[#FAF7F3]"
                      : "bg-[#A57D4E] hover:bg-[#8C6839] text-white"
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4 stroke-[2]" />
                      <span>Added to Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 stroke-[1.5]" />
                      <span>Add to Bag (₹{(product.price * quantity).toLocaleString("en-IN")})</span>
                    </>
                  )}
                </button>

                {/* Wishlist Button */}
                <button
                  type="button"
                  onClick={() => onToggleWishlist(product.id)}
                  aria-label="Wishlist"
                  className={`p-3 rounded-lg border flex items-center justify-center transition-colors ${
                    isWishlisted
                      ? "bg-[#6A1A24] text-white border-[#6A1A24]"
                      : "border-[#C5A47E]/60 bg-white text-[#231610] hover:text-[#C5A47E]"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-[10px] sm:text-[11px] text-[#7A6F68]">
                <div className="flex items-center gap-1.5 justify-center py-1.5 bg-white/70 rounded border border-[#EAE2D8]/60">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C5A47E]" />
                  <span>100% Authentic</span>
                </div>
                <div className="flex items-center gap-1.5 justify-center py-1.5 bg-white/70 rounded border border-[#EAE2D8]/60">
                  <Truck className="w-3.5 h-3.5 text-[#C5A47E]" />
                  <span>Express Dispatch</span>
                </div>
                <div className="flex items-center gap-1.5 justify-center py-1.5 bg-white/70 rounded border border-[#EAE2D8]/60">
                  <RotateCcw className="w-3.5 h-3.5 text-[#C5A47E]" />
                  <span>Easy Exchange</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
