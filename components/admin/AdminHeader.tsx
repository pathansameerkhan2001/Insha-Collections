"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ExternalLink, ShieldCheck, ChevronRight } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

interface AdminHeaderProps {
  onToggleMobileSidebar: () => void;
}

export default function AdminHeader({ onToggleMobileSidebar }: AdminHeaderProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const getBreadcrumbs = () => {
    const parts = pathname.split("/").filter(Boolean);
    const crumbs = [{ label: "Admin", href: "/admin" }];

    if (parts.length > 1) {
      if (parts[1] === "products") {
        crumbs.push({ label: "Products", href: "/admin/products" });
        if (parts[2] === "new") {
          crumbs.push({ label: "Add Product", href: "/admin/products/new" });
        } else if (parts[3] === "edit") {
          crumbs.push({ label: "Edit Product", href: pathname });
        }
      } else if (parts[1] === "orders") {
        crumbs.push({ label: "Orders", href: "/admin/orders" });
      } else if (parts[1] === "settings") {
        crumbs.push({ label: "Settings", href: "/admin/settings" });
      }
    }

    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-20 bg-[#FAF7F3]/95 backdrop-blur-md border-b border-[#EAE2D8] px-4 sm:px-8 py-3.5 flex items-center justify-between transition-all">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 -ml-2 text-[#231610] hover:text-[#9C5A2C] hover:bg-[#F3ECE4] rounded-lg transition-colors cursor-pointer"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5 stroke-[1.5]" />
        </button>

        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs sm:text-sm">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.href + idx}>
                {idx > 0 && (
                  <ChevronRight className="w-3.5 h-3.5 text-[#A89E96] stroke-[1.5] shrink-0" />
                )}
                {isLast ? (
                  <span className="font-semibold text-[#231610] font-serif-luxury truncate max-w-[140px] sm:max-w-none">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="text-[#7A6F68] hover:text-[#9C5A2C] transition-colors truncate"
                  >
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Right: Store Link & Admin Badge */}
      <div className="flex items-center gap-3 sm:gap-4">
        <Link
          href="/"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-[#7A6F68] hover:text-[#9C5A2C] py-1.5 px-3 rounded-lg border border-[#EAE2D8] hover:bg-[#F3ECE4] transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Live Store</span>
        </Link>

        <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-[#EAE2D8]">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#B89366]/20 border border-[#C5A47E] flex items-center justify-center text-[#9C7342] font-serif-luxury text-xs font-bold shrink-0 shadow-xs">
            {user?.username ? user.username.charAt(0).toUpperCase() : "A"}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-[#231610] leading-none">
              {user?.name || user?.username || "Store Admin"}
            </div>
            <div className="text-[10px] text-[#7A6F68] mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#B89366]" />
              <span>Verified Admin</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
