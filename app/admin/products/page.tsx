"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  PlusCircle,
  Search,
  Edit2,
  Trash2,
  Loader2,
  Tag,
  CheckCircle2,
} from "lucide-react";
import { ProductCategory, ProductRecord, getStorefrontImageUrl } from "@/lib/products/productTypes";
import DeleteProductModal from "@/components/admin/DeleteProductModal";

const CATEGORY_TABS: { id: string; label: string }[] = [
  { id: "all", label: "All Items" },
  { id: "jewellery", label: "Jewellery" },
  { id: "korean", label: "Korean Items" },
  { id: "dresses", label: "Readymade Dresses" },
  { id: "materials", label: "Dress Materials" },
  { id: "handlooms", label: "Handlooms" },
  { id: "beauty", label: "Beauty & Salon" },
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Success toast notification
  const [toastMessage, setToastMessage] = useState("");

  const refreshProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== "all") {
        params.set("category", selectedCategory);
      }
      if (selectedStatus && selectedStatus !== "All") {
        params.set("status", selectedStatus);
      }
      if (searchQuery.trim()) {
        params.set("query", searchQuery.trim());
      }

      const res = await fetch(`/api/admin/products?${params.toString()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error("Error refreshing products:", err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategory && selectedCategory !== "all") {
          params.set("category", selectedCategory);
        }
        if (selectedStatus && selectedStatus !== "All") {
          params.set("status", selectedStatus);
        }
        if (searchQuery.trim()) {
          params.set("query", searchQuery.trim());
        }

        const res = await fetch(`/api/admin/products?${params.toString()}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        const data = await res.json();
        if (isMounted && data.products) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error("Error fetching admin products:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [selectedCategory, selectedStatus, searchQuery]);

  const handleDeleteClick = (product: ProductRecord) => {
    setProductToDelete({ id: product.id, name: product.name });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
        cache: "no-store",
      });

      const data = await res.json();
      if (data.success) {
        setToastMessage("Product deleted successfully.");
        setTimeout(() => setToastMessage(""), 3500);
        refreshProducts();
      }
    } catch (err) {
      console.error("Failed to delete product:", err);
    }
  };

  const formatCategoryBadge = (cat: ProductCategory) => {
    switch (cat) {
      case "jewellery":
        return { label: "Jewellery", bg: "bg-[#B89366]/15 text-[#8C6332] border-[#B89366]/30" };
      case "korean":
        return { label: "Korean", bg: "bg-[#9C5A2C]/15 text-[#9C5A2C] border-[#9C5A2C]/30" };
      case "dresses":
        return { label: "Dresses", bg: "bg-[#6A1A24]/10 text-[#6A1A24] border-[#6A1A24]/30" };
      case "materials":
        return { label: "Materials", bg: "bg-[#A57D4E]/15 text-[#7D5424] border-[#A57D4E]/30" };
      case "handlooms":
        return { label: "Handlooms", bg: "bg-[#4A3B32]/15 text-[#4A3B32] border-[#4A3B32]/30" };
      case "beauty":
        return { label: "Beauty & Salon", bg: "bg-[#7A4050]/15 text-[#7A4050] border-[#7A4050]/30" };
      default:
        return { label: cat, bg: "bg-gray-100 text-gray-800 border-gray-200" };
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#231610] text-[#FAF7F3] px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs sm:text-sm animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-[#C5A47E]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#EAE2D8]">
        <div>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-semibold text-[#231610] tracking-tight">
            Product Management
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6F68] mt-1">
            Manage inventory, create new items, update prices, and control store availability.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#B89366] to-[#9C7342] hover:from-[#A88255] hover:to-[#8C6332] text-white text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all shadow-md active:scale-95 shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ ADD PRODUCT</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FFFDFB] border border-[#EAE2D8] rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === tab.id
                  ? "bg-[#231610] text-[#FAF7F3] shadow-xs"
                  : "bg-[#FAF7F3] text-[#7A6F68] hover:bg-[#F3ECE4] hover:text-[#231610]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Status Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-2 relative flex items-center">
            <Search className="w-4 h-4 text-[#8C7E75] absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name, SKU, subcategory, or material..."
              className="w-full bg-[#FAF7F3] text-[#231610] text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-[#EAE2D8] focus:border-[#B89366] focus:outline-none placeholder:text-[#A89E96]"
            />
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-[#FAF7F3] text-[#231610] text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-[#EAE2D8] focus:border-[#B89366] focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active (In Store)</option>
              <option value="Draft">Draft (Hidden)</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Counter & Info */}
      <div className="flex items-center justify-between text-xs text-[#7A6F68] px-1">
        <span>
          Showing <span className="font-semibold text-[#231610]">{products.length}</span> items
        </span>
        {selectedCategory !== "all" && (
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("all");
              setSelectedStatus("All");
              setSearchQuery("");
            }}
            className="text-[#9C5A2C] hover:underline cursor-pointer"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Main Products List Area */}
      {isLoading ? (
        <div className="bg-[#FFFDFB] border border-[#EAE2D8] rounded-2xl p-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-[#B89366] animate-spin" />
          <span className="text-xs font-serif-luxury tracking-widest text-[#7A6F68] uppercase">
            Loading Catalog...
          </span>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-[#FFFDFB] border border-[#EAE2D8] rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#C5A47E]/15 text-[#B89366] flex items-center justify-center mx-auto">
            <Tag className="w-6 h-6 stroke-[1.6]" />
          </div>
          <h3 className="font-serif-luxury text-lg font-semibold text-[#231610]">
            No Products Found
          </h3>
          <p className="text-xs text-[#7A6F68] max-w-sm mx-auto">
            No items matched your current filter criteria. Try adjusting your search query or add a new product.
          </p>
          <div className="pt-2">
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#231610] text-[#FAF7F3] text-xs font-medium hover:bg-[#3D281D] transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add First Product</span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table View (>= 1024px) */}
          <div className="hidden lg:block bg-[#FFFDFB] border border-[#EAE2D8] rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#FAF7F3] border-b border-[#EAE2D8] text-[#7A6F68] uppercase tracking-wider text-[11px] font-semibold">
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE2D8]/60">
                {products.map((product) => {
                  const catBadge = formatCategoryBadge(product.category);
                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-[#FAF7F3]/70 transition-colors group"
                    >
                      {/* Product Thumbnail & Details */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3.5">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#FAF7F3] border border-[#EAE2D8] shrink-0">
                            <Image
                              src={getStorefrontImageUrl(product)}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                              unoptimized={getStorefrontImageUrl(product).startsWith("/api/images/s3/")}
                            />
                          </div>
                          <div className="max-w-[260px] truncate">
                            <div className="font-semibold text-[#231610] text-sm group-hover:text-[#9C5A2C] transition-colors truncate">
                              {product.name}
                            </div>
                            <div className="text-[11px] text-[#8C7E75] font-mono mt-0.5">
                              {product.sku || product.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category & Subcategory */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col items-start gap-1">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${catBadge.bg}`}
                          >
                            {catBadge.label}
                          </span>
                          <span className="text-[11px] text-[#7A6F68] truncate max-w-[140px]">
                            {product.subCategory}
                          </span>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#231610] text-sm">
                          ₹{product.price.toLocaleString("en-IN")}
                        </div>
                        {product.salePrice && product.salePrice > product.price && (
                          <div className="text-[11px] text-[#8C7E75] line-through">
                            ₹{product.salePrice.toLocaleString("en-IN")}
                          </div>
                        )}
                      </td>

                      {/* Stock Quantity */}
                      <td className="py-3.5 px-4">
                        {product.category === "beauty" ? (
                          <span className="text-xs text-[#7A6F68] font-medium">
                            Service / Booking
                          </span>
                        ) : (
                          <span className="font-medium text-xs text-[#231610]">
                            {product.stockQuantity ?? 0} units
                          </span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            product.status === "Active"
                              ? "bg-[#2D5A27]/10 text-[#2D5A27]"
                              : product.status === "Draft"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-[#6A1A24]/10 text-[#6A1A24]"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              product.status === "Active"
                                ? "bg-[#2D5A27]"
                                : product.status === "Draft"
                                ? "bg-amber-600"
                                : "bg-[#6A1A24]"
                            }`}
                          />
                          <span>{product.status}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="p-2 rounded-lg text-[#7A6F68] hover:text-[#9C5A2C] hover:bg-[#F3ECE4] transition-colors"
                            title="Edit product"
                          >
                            <Edit2 className="w-4 h-4 stroke-[1.6]" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDeleteClick(product)}
                            className="p-2 rounded-lg text-[#7A6F68] hover:text-[#6A1A24] hover:bg-[#6A1A24]/10 transition-colors cursor-pointer"
                            title="Delete product"
                          >
                            <Trash2 className="w-4 h-4 stroke-[1.6]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile & Tablet Card View (< 1024px) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4">
            {products.map((product) => {
              const catBadge = formatCategoryBadge(product.category);
              return (
                <div
                  key={product.id}
                  className="bg-[#FFFDFB] border border-[#EAE2D8] rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-xs"
                >
                  <div className="flex gap-3.5">
                    {/* Thumbnail */}
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#FAF7F3] border border-[#EAE2D8] shrink-0">
                      <Image
                        src={getStorefrontImageUrl(product)}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                        unoptimized={getStorefrontImageUrl(product).startsWith("/api/images/s3/")}
                      />
                    </div>

                    {/* Meta info */}
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className={`inline-block px-2 py-0.2 rounded-full text-[9px] font-semibold border ${catBadge.bg}`}
                        >
                          {catBadge.label}
                        </span>
                        <span
                          className={`text-[9px] font-semibold ${
                            product.status === "Active"
                              ? "text-[#2D5A27]"
                              : "text-[#6A1A24]"
                          }`}
                        >
                          • {product.status}
                        </span>
                      </div>

                      <h4 className="font-semibold text-[#231610] text-sm leading-snug line-clamp-2">
                        {product.name}
                      </h4>

                      <div className="text-[11px] text-[#7A6F68] mt-0.5 truncate">
                        {product.subCategory}
                      </div>

                      <div className="flex items-baseline gap-2 mt-1.5">
                        <span className="font-bold text-sm text-[#231610]">
                          ₹{product.price.toLocaleString("en-IN")}
                        </span>
                        {product.salePrice && product.salePrice > product.price && (
                          <span className="text-[11px] text-[#8C7E75] line-through">
                            ₹{product.salePrice.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bottom Bar */}
                  <div className="pt-2 border-t border-[#EAE2D8]/60 flex items-center justify-between">
                    <span className="text-[11px] text-[#8C7E75] font-mono">
                      {product.sku || product.id}
                    </span>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="px-3 py-1.5 rounded-lg border border-[#D8CEBE] text-xs font-medium text-[#231610] hover:bg-[#F3ECE4] transition-colors flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDeleteClick(product)}
                        className="p-1.5 rounded-lg text-[#6A1A24] hover:bg-[#6A1A24]/10 transition-colors cursor-pointer"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <DeleteProductModal
          isOpen={deleteModalOpen}
          productId={productToDelete.id}
          productName={productToDelete.name}
          onClose={() => {
            setDeleteModalOpen(false);
            setProductToDelete(null);
          }}
          onConfirmDelete={handleConfirmDelete}
        />
      )}
    </div>
  );
}
