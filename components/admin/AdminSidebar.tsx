"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingBag,
  Settings,
  LogOut,
  ExternalLink,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Products",
      href: "/admin/products",
      icon: Package,
      exact: true,
    },
    {
      label: "Add Product",
      href: "/admin/products/new",
      icon: PlusCircle,
      exact: true,
    },
    {
      label: "Orders",
      href: "/admin/orders",
      icon: ShoppingBag,
      exact: false,
    },
    {
      label: "Settings",
      href: "/admin/settings",
      icon: Settings,
      exact: false,
    },
  ];

  const isLinkActive = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#1F140E] text-[#EAE2D8] select-none border-r border-[#3A281D]">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#3A281D]/80 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-white/10 p-1 flex items-center justify-center border border-[#C5A47E]/30">
            <Image
              src="/images/New-logo.jpeg"
              alt="Insha Collections"
              fill
              className="object-contain"
              sizes="36px"
            />
          </div>
          <div>
            <span className="block font-serif-luxury text-sm font-semibold tracking-wider text-[#FAF7F3] group-hover:text-[#C5A47E] transition-colors">
              INSHA COLLECTIONS
            </span>
            <span className="block text-[10px] text-[#A59487] uppercase tracking-widest font-sans">
              Admin Workspace
            </span>
          </div>
        </Link>

        {/* Mobile Close Button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 text-[#A59487] hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Admin Navigation */}
      <div className="flex-1 py-5 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-[#8C7A6D] uppercase tracking-[0.2em] font-serif-luxury">
          Management
        </div>

        {navItems.map((item) => {
          const active = isLinkActive(item.href, item.exact);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all group ${
                active
                  ? "bg-gradient-to-r from-[#B89366]/25 to-[#B89366]/10 text-[#FAF7F3] border-l-2 border-[#C5A47E] shadow-inner font-semibold"
                  : "text-[#C4B7AC] hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon
                className={`w-4 h-4 stroke-[1.6] transition-colors ${
                  active
                    ? "text-[#C5A47E]"
                    : "text-[#8C7A6D] group-hover:text-[#C5A47E]"
                }`}
              />
              <span className="tracking-wide">{item.label}</span>
              {active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#C5A47E] shadow-[0_0_8px_#C5A47E]" />
              )}
            </Link>
          );
        })}

        <div className="pt-6 px-3 pb-2 text-[10px] font-semibold text-[#8C7A6D] uppercase tracking-[0.2em] font-serif-luxury">
          Quick Links
        </div>

        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-[#C4B7AC] hover:bg-white/5 hover:text-white transition-all group"
        >
          <div className="flex items-center gap-3">
            <ExternalLink className="w-4 h-4 text-[#8C7A6D] group-hover:text-[#C5A47E] stroke-[1.6]" />
            <span className="tracking-wide">View Live Store</span>
          </div>
          <span className="text-[10px] bg-[#3A281D] text-[#C5A47E] px-1.5 py-0.5 rounded font-mono">
            Public
          </span>
        </Link>
      </div>

      {/* Admin User Footer / Logout */}
      <div className="p-4 border-t border-[#3A281D] bg-[#19100B]">
        <div className="flex items-center justify-between gap-3 mb-3 px-1">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-[#B89366]/20 border border-[#C5A47E]/40 flex items-center justify-center text-[#C5A47E] font-serif-luxury text-xs font-bold shrink-0">
              {user?.username ? user.username.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-[#FAF7F3] truncate">
                {user?.name || user?.username || "Admin"}
              </div>
              <div className="text-[10px] text-[#8C7A6D] capitalize">
                {user?.role || "Store Manager"}
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => logout()}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[#D9A0A0] hover:text-white hover:bg-[#6A1A24]/40 border border-[#6A1A24]/30 transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5 stroke-[1.6]" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 z-30 shadow-xl">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile Slide-out Drawer */}
      <div
        className={`lg:hidden fixed top-0 bottom-0 left-0 w-72 max-w-[85vw] z-50 transform transition-transform duration-300 ease-in-out shadow-2xl ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
}
