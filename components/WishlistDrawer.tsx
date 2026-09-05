"use client";

import React from "react";
import Image from "next/image";
import { X, Heart, ShoppingBag, Trash2 } from "lucide-react";
import { ProductItem } from "@/data/catalog";

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistItems: ProductItem[];
  onRemoveFromWishlist: (productId: string) => void;
  onMoveToCart: (product: ProductItem) => void;
}

export default function WishlistDrawer({
  isOpen,
  onClose,
  wishlistItems,
  onRemoveFromWishlist,
  onMoveToCart,
}: WishlistDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md h-full bg-[#FAF7F3] border-l border-[#C5A47E]/40 flex flex-col justify-between p-6 sm:p-7 shadow-2xl text-[#231610] animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EAE2D8]">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#6A1A24] fill-current" />
            <h2 className="text-base sm:text-lg font-normal text-[#231610] font-serif-luxury tracking-wider uppercase">
              My Wishlist ({wishlistItems.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white text-[#231610] hover:bg-[#231610] hover:text-white border border-[#EAE2D8] flex items-center justify-center transition-colors focus:outline-none"
            aria-label="Close wishlist"
          >
            <X className="w-4 h-4 stroke-[1.5]" />
          </button>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {wishlistItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12 space-y-3">
              <div className="w-14 h-14 rounded-full bg-[#EAE2D8]/60 flex items-center justify-center text-[#6A1A24]">
                <Heart className="w-6 h-6 stroke-[1.4]" />
              </div>
              <p className="text-sm font-medium text-[#231610]">Your wishlist is empty</p>
              <p className="text-xs text-[#7A6F68]">Tap the heart icon on any product to save it here.</p>
            </div>
          ) : (
            wishlistItems.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3.5 bg-white p-3 rounded-xl border border-[#EAE2D8] shadow-sm"
              >
                {/* Image */}
                <div className="relative w-16 h-16 rounded-lg bg-[#F5ECE5] overflow-hidden flex-shrink-0 border border-[#EAE2D8]">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="64px"
                    className="object-cover object-center"
                    unoptimized={product.image.startsWith("/api/images/s3/")}
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-medium text-[#231610] font-serif-luxury truncate">
                    {product.name}
                  </h3>
                  <p className="text-[10px] text-[#A57D4E] uppercase">{product.subCategory}</p>
                  <p className="text-xs font-bold text-[#231610] mt-0.5">
                    ₹{product.price.toLocaleString("en-IN")}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => onMoveToCart(product)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#A57D4E] hover:bg-[#8C6839] text-white text-[11px] font-semibold rounded-md transition-colors"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>Move to Bag</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onRemoveFromWishlist(product.id)}
                      className="text-[#9E9085] hover:text-[#6A1A24] p-1 transition-colors"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {wishlistItems.length > 0 && (
          <div className="pt-4 border-t border-[#EAE2D8]">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-xl border border-[#C5A47E] bg-[#FAF7F3] hover:bg-[#231610] text-[#231610] hover:text-[#FAF7F3] text-xs font-semibold tracking-wider uppercase transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
