"use client";

import React from "react";
import Image from "next/image";
import { X, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { ProductItem } from "@/data/catalog";

export interface CartEntry {
  product: ProductItem;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartEntry[];
  onUpdateQty: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout?: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQty,
  onRemoveItem,
  onProceedToCheckout,
}: CartDrawerProps) {
  if (!isOpen) return null;

  const totalAmount = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const totalItemsCount = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md h-full bg-[#FAF7F3] border-l border-[#C5A47E]/40 flex flex-col justify-between p-5 sm:p-7 shadow-2xl text-[#231610] animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EAE2D8]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#BA7442]" />
            <h2 className="text-base sm:text-lg font-normal text-[#231610] font-serif-luxury tracking-wider uppercase">
              Your Cart ({totalItemsCount})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white text-[#231610] hover:bg-[#231610] hover:text-white border border-[#EAE2D8] flex items-center justify-center transition-colors focus:outline-none cursor-pointer"
            aria-label="Close cart"
          >
            <X className="w-4 h-4 stroke-[1.5]" />
          </button>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3.5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12 space-y-3.5">
              <div className="w-16 h-16 rounded-full bg-[#EAE2D8]/60 flex items-center justify-center text-[#BA7442]">
                <ShoppingBag className="w-7 h-7 stroke-[1.4]" />
              </div>
              <h3 className="text-base font-normal text-[#231610] font-serif-luxury tracking-wider uppercase">
                YOUR CART IS EMPTY
              </h3>
              <p className="text-xs text-[#7A6F68] max-w-xs">
                Discover our royal collections and add items to your cart.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 px-6 py-2.5 rounded-xl bg-[#231610] hover:bg-[#BA7442] text-[#FAF7F3] text-xs font-semibold tracking-widest uppercase transition-colors cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex items-center gap-3.5 bg-white p-3 rounded-xl border border-[#EAE2D8] shadow-xs"
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
                  <p className="text-[10px] text-[#BA7442] uppercase font-medium">{product.subCategory}</p>
                  <p className="text-xs font-bold text-[#231610] mt-0.5">
                    ₹{product.price.toLocaleString("en-IN")}
                  </p>

                  {/* Quantity */}
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex items-center border border-[#D5C2AF] rounded-lg bg-[#FAF7F3] text-xs">
                      <button
                        type="button"
                        onClick={() => onUpdateQty(product.id, -1)}
                        className="px-2.5 py-0.5 hover:bg-white text-[#231610] transition-colors cursor-pointer font-bold"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="px-2 py-0.5 font-semibold text-[11px] text-[#231610] min-w-[20px] text-center">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQty(product.id, 1)}
                        className="px-2.5 py-0.5 hover:bg-white text-[#231610] transition-colors cursor-pointer font-bold"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveItem(product.id)}
                      className="text-[#9E9085] hover:text-[#C53030] p-1 transition-colors cursor-pointer"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Item Total */}
                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-bold text-[#231610]">
                    ₹{(product.price * quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Checkout */}
        {items.length > 0 && (
          <div className="pt-4 border-t border-[#EAE2D8] space-y-3">
            <div className="space-y-1.5 text-xs text-[#6B5E55]">
              <div className="flex justify-between">
                <span>Total Items</span>
                <span className="font-semibold text-[#231610]">{totalItemsCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-[#231610]">
                  ₹{totalAmount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Standard Delivery</span>
                <span className="text-[#15803D] font-semibold">FREE</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#231610] pt-2 border-t border-[#EAE2D8]">
                <span>Total Amount</span>
                <span className="text-[#BA7442]">₹{totalAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (onProceedToCheckout) {
                  onProceedToCheckout();
                }
              }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#BA7442] to-[#9C5A2C] hover:from-[#A86435] hover:to-[#80421B] text-white text-xs sm:text-sm font-semibold tracking-widest uppercase transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>PROCEED TO CHECKOUT</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
