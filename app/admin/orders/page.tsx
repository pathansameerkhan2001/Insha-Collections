"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  ExternalLink,
  MessageSquare,
} from "lucide-react";

export default function AdminOrdersPage() {
  const [selectedFilter, setSelectedFilter] = useState("all");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#EAE2D8]">
        <div>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-semibold text-[#231610] tracking-tight">
            Orders Management
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6F68] mt-1">
            Track and oversee customer purchases dispatched through the Insha Collections WhatsApp Checkout system.
          </p>
        </div>

        <a
          href="https://wa.me/919618648050"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#23471F] text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-sm shrink-0"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Open WhatsApp Business (+91 9618648050)</span>
        </a>
      </div>

      {/* Orders Filter Tabs */}
      <div className="bg-[#FFFDFB] border border-[#EAE2D8] rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {["all", "new", "processing", "completed", "cancelled"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setSelectedFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-medium uppercase tracking-wider transition-all cursor-pointer ${
                selectedFilter === tab
                  ? "bg-[#231610] text-[#FAF7F3] shadow-xs"
                  : "bg-[#FAF7F3] text-[#7A6F68] hover:bg-[#F3ECE4] hover:text-[#231610]"
              }`}
            >
              {tab === "all" ? "All Orders" : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Empty State (No Fake Orders) */}
      <div className="bg-[#FFFDFB] border border-[#EAE2D8] rounded-2xl p-12 sm:p-16 text-center space-y-4 shadow-xs">
        <div className="w-14 h-14 rounded-full bg-[#C5A47E]/15 text-[#B89366] flex items-center justify-center mx-auto">
          <ShoppingBag className="w-7 h-7 stroke-[1.5]" />
        </div>

        <h3 className="font-serif-luxury text-xl font-semibold text-[#231610]">
          No orders yet.
        </h3>

        <p className="text-xs sm:text-sm text-[#7A6F68] max-w-md mx-auto leading-relaxed">
          Customer orders placed through WhatsApp Checkout will appear here. When a buyer completes the checkout on Insha Collections, order details are instantly transmitted to WhatsApp reception (+91 9618648050).
        </p>

        <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FAF7F3] border border-[#D8CEBE] text-[#231610] text-xs font-medium hover:bg-[#F3ECE4] transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Test Customer Checkout on Live Store</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
