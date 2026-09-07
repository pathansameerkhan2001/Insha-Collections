"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Package,
  PlusCircle,
  Gem,
  Scissors,
  Shirt,
  Layers,
  Grid as GridIcon,
  Flower2,
  ExternalLink,
  ShieldCheck,
  Cloud,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

interface CategorySummary {
  total: number;
  jewellery: number;
  korean: number;
  dresses: number;
  materials: number;
  handlooms: number;
  beauty: number;
  active: number;
  draft: number;
  outOfStock: number;
}

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<CategorySummary>({
    total: 0,
    jewellery: 0,
    korean: 0,
    dresses: 0,
    materials: 0,
    handlooms: 0,
    beauty: 0,
    active: 0,
    draft: 0,
    outOfStock: 0,
  });
  const [isCognitoMode, setIsCognitoMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/admin/products", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        const data = await res.json();
        if (data.summary) {
          setSummary(data.summary);
        }

        const sessionRes = await fetch("/api/auth/session", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        const sessionData = await sessionRes.json();
        setIsCognitoMode(Boolean(sessionData.cognitoMode));
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const metricCards = [
    {
      title: "Total Catalog Items",
      count: summary.total,
      icon: Package,
      href: "/admin/products",
      color: "text-[#231610]",
      bg: "bg-[#F3ECE4]",
      sub: `${summary.active} Active • ${summary.outOfStock} Out of Stock`,
    },
    {
      title: "Jewellery Collection",
      count: summary.jewellery,
      icon: Gem,
      href: "/admin/products?category=jewellery",
      color: "text-[#B89366]",
      bg: "bg-[#B89366]/15",
      sub: "Kundan, Polki & Anti-Tarnish",
    },
    {
      title: "Korean Accessories",
      count: summary.korean,
      icon: Scissors,
      href: "/admin/products?category=korean",
      color: "text-[#9C5A2C]",
      bg: "bg-[#9C5A2C]/15",
      sub: "Claw Clips, Scrunchies & Bows",
    },
    {
      title: "Readymade Dresses",
      count: summary.dresses,
      icon: Shirt,
      href: "/admin/products?category=dresses",
      color: "text-[#6A1A24]",
      bg: "bg-[#6A1A24]/15",
      sub: "Anarkali, Kurtis & Festive",
    },
    {
      title: "Dress Materials",
      count: summary.materials,
      icon: Layers,
      href: "/admin/products?category=materials",
      color: "text-[#A57D4E]",
      bg: "bg-[#A57D4E]/15",
      sub: "Silks, Cottons & Unstitched",
    },
    {
      title: "Handloom Weaves",
      count: summary.handlooms,
      icon: GridIcon,
      href: "/admin/products?category=handlooms",
      color: "text-[#4A3B32]",
      bg: "bg-[#4A3B32]/15",
      sub: "Curtains, Linen & Throws",
    },
    {
      title: "Beauty & Salon Services",
      count: summary.beauty,
      icon: Flower2,
      href: "/admin/products?category=beauty",
      color: "text-[#7A4050]",
      bg: "bg-[#7A4050]/15",
      sub: "Facials, Spa & Treatments",
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#1F140E] to-[#3A281D] text-[#FAF7F3] rounded-3xl p-6 sm:p-8 lg:p-10 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#C5A47E]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-[#C5A47E]/20 border border-[#C5A47E]/40 px-3 py-1 rounded-full text-xs text-[#EAE2D8] mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A47E]" />
            <span className="font-serif-luxury uppercase tracking-wider">
              Store Control Center
            </span>
          </div>

          <h1 className="font-serif-luxury text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight leading-tight">
            Welcome to Insha Collections Admin
          </h1>

          <p className="text-xs sm:text-sm text-[#C4B7AC] mt-2 leading-relaxed">
            Manage your fashion catalog, update anti-tarnish jewelry, curate Korean accessories, oversee salon services, and manage store inventory in one unified space.
          </p>

          {/* Quick Actions Buttons */}
          <div className="flex flex-wrap items-center gap-3 mt-6 pt-2">
            <Link
              href="/admin/products/new"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#B89366] to-[#9C7342] hover:from-[#A88255] hover:to-[#8C6332] text-white text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add New Product</span>
            </Link>

            <Link
              href="/admin/products"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-medium transition-all flex items-center gap-2 cursor-pointer"
            >
              <Package className="w-4 h-4 text-[#C5A47E]" />
              <span>Manage Products</span>
            </Link>

            <Link
              href="/"
              target="_blank"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-medium transition-all flex items-center gap-2 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-[#C5A47E]" />
              <span>View Live Store</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Summary Stat Metric Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif-luxury text-lg sm:text-xl font-semibold text-[#231610]">
            Catalog Overview
          </h2>
          <span className="text-xs text-[#7A6F68]">
            Updated live from store database
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {metricCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title + idx}
                href={card.href}
                className="bg-[#FFFDFB] border border-[#EAE2D8] hover:border-[#C5A47E] rounded-2xl p-5 sm:p-6 transition-all duration-200 hover:shadow-md group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-[#7A6F68] uppercase tracking-wider">
                      {card.title}
                    </span>
                    <div
                      className={`w-9 h-9 rounded-xl ${card.bg} ${card.color} flex items-center justify-center transition-transform group-hover:scale-110`}
                    >
                      <Icon className="w-4 h-4 stroke-[1.8]" />
                    </div>
                  </div>

                  <div className="text-2xl sm:text-3xl font-serif-luxury font-bold text-[#231610]">
                    {isLoading ? "..." : card.count}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#EAE2D8]/60 flex items-center justify-between text-xs text-[#8C7E75]">
                  <span className="truncate">{card.sub}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#B89366] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* System Status Architecture Section */}
      <div className="bg-[#FFFDFB] border border-[#EAE2D8] rounded-2xl p-6 sm:p-8">
        <h2 className="font-serif-luxury text-lg font-semibold text-[#231610] mb-4 pb-2 border-b border-[#EAE2D8]/60">
          Cloud Infrastructure & Integrations Status
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* 1. AWS S3 Storage Status */}
          <div className="p-4 rounded-xl border border-[#EAE2D8] bg-[#FAF7F3] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-[#BA7442]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[#231610]">
                  AWS S3 Storage
                </span>
              </div>
              <span className="text-[10px] bg-[#EAE2D8] text-[#5A4E46] px-2 py-0.5 rounded-full font-mono">
                {process.env.NEXT_PUBLIC_AWS_S3_BUCKET ? "CONFIGURED" : "PENDING"}
              </span>
            </div>

            <p className="text-xs text-[#7A6F68]">
              Bucket: <code className="text-[#9C5A2C] font-mono">insha-collection-assets</code>
            </p>

            <div className="pt-2 text-[11px] text-[#7A6F68] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#BA7442]" />
              <span>S3 upload route ready (Secure Server-Side)</span>
            </div>
          </div>

          {/* 2. AWS Cognito Auth Status */}
          <div className="p-4 rounded-xl border border-[#EAE2D8] bg-[#FAF7F3] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#BA7442]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[#231610]">
                  AWS Cognito Auth
                </span>
              </div>
              <span className="text-[10px] bg-[#EAE2D8] text-[#5A4E46] px-2 py-0.5 rounded-full font-mono">
                {isCognitoMode ? "ACTIVE" : "READY"}
              </span>
            </div>

            <p className="text-xs text-[#7A6F68]">
              {isCognitoMode
                ? "Cognito User Pool credentials active"
                : "Dev session active; Cognito abstraction ready"}
            </p>

            <div className="pt-2 text-[11px] text-[#7A6F68] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#2D5A27]" />
              <span>Protected routes & JWT session handler active</span>
            </div>
          </div>

          {/* 3. WhatsApp Cloud API Checkout Status */}
          <div className="p-4 rounded-xl border border-[#EAE2D8] bg-[#FAF7F3] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#2D5A27]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[#231610]">
                  WhatsApp Checkout
                </span>
              </div>
              <span className="text-[10px] bg-[#2D5A27]/10 text-[#2D5A27] px-2 py-0.5 rounded-full font-bold">
                ONLINE
              </span>
            </div>

            <p className="text-xs text-[#7A6F68]">
              Orders Receiver: <code className="text-[#231610] font-mono">+91 9618648050</code>
            </p>

            <div className="pt-2 text-[11px] text-[#7A6F68] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2D5A27]" />
              <span>WhatsApp Cloud API dispatch active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
