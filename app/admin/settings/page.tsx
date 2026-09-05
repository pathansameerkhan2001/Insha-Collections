"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  Cloud,
  MessageSquare,
  Store,
  Layers,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
  AlertTriangle,
  FolderPlus,
  Zap,
  Sparkles,
  Image as ImageIcon,
} from "lucide-react";
import { ProductCategory } from "@/lib/products/productTypes";

interface SubCategoryItem {
  id: string;
  name: string;
  categoryId: ProductCategory;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

const CATEGORY_LIST: { id: ProductCategory; label: string }[] = [
  { id: "jewellery", label: "Jewellery" },
  { id: "korean", label: "Korean Items" },
  { id: "dresses", label: "Readymade Dresses" },
  { id: "materials", label: "Dress Materials" },
  { id: "handlooms", label: "Handlooms" },
  { id: "beauty", label: "Beauty & Salon" },
];

export default function AdminSettingsPage() {
  const [cognitoConfigured, setCognitoConfigured] = useState(false);

  // Subcategory management state
  const [activeCategory, setActiveCategory] = useState<ProductCategory>("jewellery");
  const [subcategoriesMap, setSubcategoriesMap] = useState<Record<ProductCategory, SubCategoryItem[]>>({
    jewellery: [],
    korean: [],
    dresses: [],
    materials: [],
    handlooms: [],
    beauty: [],
  });
  const [isLoadingSubs, setIsLoadingSubs] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Image optimization state
  const [isOptimizingImages, setIsOptimizingImages] = useState(false);
  const [optimizeResult, setOptimizeResult] = useState<string | null>(null);

  const handleBatchOptimizeImages = async () => {
    setIsOptimizingImages(true);
    setOptimizeResult(null);
    try {
      const res = await fetch("/api/admin/images/optimize-catalog", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setOptimizeResult(data.message);
        setStatusMessage({ type: "success", text: data.message });
      } else {
        throw new Error(data.error || "Optimization failed.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Image optimization failed";
      setOptimizeResult(msg);
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setIsOptimizingImages(false);
    }
  };

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSubName, setNewSubName] = useState("");
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);
  const [addModalError, setAddModalError] = useState("");

  const [editingSub, setEditingSub] = useState<SubCategoryItem | null>(null);
  const [editSubName, setEditSubName] = useState("");
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editModalError, setEditModalError] = useState("");

  const [deletingSub, setDeletingSub] = useState<SubCategoryItem | null>(null);
  const [reassignTarget, setReassignTarget] = useState("");
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);
  const [deleteModalError, setDeleteModalError] = useState("");

  const fetchSubcategories = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/subcategories");
      if (res.ok) {
        const data = await res.json();
        if (data.subcategories) {
          setSubcategoriesMap(data.subcategories);
        }
      }
    } catch (err) {
      console.error("Error loading subcategories:", err);
    } finally {
      setIsLoadingSubs(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initialize() {
      try {
        const [sessionRes, subsRes] = await Promise.all([
          fetch("/api/auth/session"),
          fetch("/api/admin/subcategories"),
        ]);

        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          if (isMounted) setCognitoConfigured(Boolean(sessionData.cognitoMode));
        }

        if (subsRes.ok) {
          const subsData = await subsRes.json();
          if (isMounted && subsData.subcategories) {
            setSubcategoriesMap(subsData.subcategories);
          }
        }
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        if (isMounted) setIsLoadingSubs(false);
      }
    }

    initialize();

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle Add Subcategory
  const handleAddSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddModalError("");

    const trimmed = newSubName.trim();
    if (!trimmed) {
      setAddModalError("Please enter a subcategory name.");
      return;
    }
    if (trimmed.length < 2) {
      setAddModalError("Subcategory name must be at least 2 characters.");
      return;
    }

    const currentList = subcategoriesMap[activeCategory] || [];
    if (currentList.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
      setAddModalError(`Subcategory "${trimmed}" already exists in this category.`);
      return;
    }

    setIsSubmittingAdd(true);

    try {
      const res = await fetch("/api/admin/subcategories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: activeCategory,
          name: trimmed,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create subcategory.");
      }

      setIsAddModalOpen(false);
      setNewSubName("");
      setStatusMessage({
        type: "success",
        text: `Subcategory "${trimmed}" created successfully!`,
      });
      await fetchSubcategories();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create subcategory";
      setAddModalError(msg);
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  // Handle Edit / Rename Subcategory
  const handleEditSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSub) return;
    setEditModalError("");

    const trimmed = editSubName.trim();
    if (!trimmed) {
      setEditModalError("Please enter a new subcategory name.");
      return;
    }
    if (trimmed.length < 2) {
      setEditModalError("Subcategory name must be at least 2 characters.");
      return;
    }

    if (trimmed.toLowerCase() === editingSub.name.toLowerCase()) {
      setIsEditingSubModalOpen(false);
      return;
    }

    const currentList = subcategoriesMap[editingSub.categoryId] || [];
    if (
      currentList.some(
        (s) => s.id !== editingSub.id && s.name.toLowerCase() === trimmed.toLowerCase()
      )
    ) {
      setEditModalError(`Another subcategory named "${trimmed}" already exists in this category.`);
      return;
    }

    setIsSubmittingEdit(true);

    try {
      const res = await fetch("/api/admin/subcategories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: editingSub.categoryId,
          oldName: editingSub.name,
          newName: trimmed,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to rename subcategory.");
      }

      setEditingSub(null);
      setEditSubName("");
      setStatusMessage({
        type: "success",
        text: `Subcategory renamed to "${trimmed}". ${data.affectedProductsCount || 0} product(s) updated.`,
      });
      await fetchSubcategories();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to rename subcategory";
      setEditModalError(msg);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Handle Delete or Reassign & Delete
  const handleDeleteSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deletingSub) return;
    setDeleteModalError("");

    if (deletingSub.productCount > 0 && !reassignTarget) {
      setDeleteModalError("Please select a replacement subcategory for the assigned products.");
      return;
    }

    setIsSubmittingDelete(true);

    try {
      const res = await fetch("/api/admin/subcategories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: deletingSub.categoryId,
          name: deletingSub.name,
          reassignTo: deletingSub.productCount > 0 ? reassignTarget : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete subcategory.");
      }

      const msg =
        deletingSub.productCount > 0
          ? `Subcategory "${deletingSub.name}" deleted. ${data.reassignedCount || deletingSub.productCount} product(s) reassigned to "${reassignTarget}".`
          : `Subcategory "${deletingSub.name}" deleted successfully.`;

      setDeletingSub(null);
      setReassignTarget("");
      setStatusMessage({ type: "success", text: msg });
      await fetchSubcategories();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete subcategory";
      setDeleteModalError(msg);
    } finally {
      setIsSubmittingDelete(false);
    }
  };

  const setIsEditingSubModalOpen = (open: boolean) => {
    if (!open) {
      setEditingSub(null);
      setEditSubName("");
      setEditModalError("");
    }
  };

  const setIsDeletingSubModalOpen = (open: boolean) => {
    if (!open) {
      setDeletingSub(null);
      setReassignTarget("");
      setDeleteModalError("");
    }
  };

  const activeCategoryLabel =
    CATEGORY_LIST.find((c) => c.id === activeCategory)?.label || activeCategory;
  const currentSubcategories = subcategoriesMap[activeCategory] || [];

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="pb-2 border-b border-[#EAE2D8]">
        <h1 className="font-serif-luxury text-2xl sm:text-3xl font-semibold text-[#231610] tracking-tight">
          Admin Settings & Integrations
        </h1>
        <p className="text-xs sm:text-sm text-[#7A6F68] mt-1">
          Store configuration, taxonomy management, cloud services status, and environment variables.
        </p>
      </div>

      {/* Global Status Notification */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl flex items-start justify-between gap-3 text-xs sm:text-sm animate-fadeIn ${
            statusMessage.type === "success"
              ? "bg-[#2D5A27]/10 border border-[#2D5A27]/20 text-[#2D5A27]"
              : "bg-[#6A1A24]/10 border border-[#6A1A24]/20 text-[#6A1A24]"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <p className="font-medium">{statusMessage.text}</p>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="p-1 rounded-md hover:bg-black/5 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBCATEGORY MANAGEMENT SECTION */}
      {/* ========================================================= */}
      <div className="bg-[#FFFDFB] border border-[#EAE2D8] rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAE2D8]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#B89366]/15 text-[#B89366] flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5 stroke-[1.6]" />
            </div>
            <div>
              <h2 className="font-serif-luxury text-lg sm:text-xl font-semibold text-[#231610]">
                SUBCATEGORY MANAGEMENT
              </h2>
              <p className="text-xs text-[#7A6F68]">
                Manage category-specific subcategories, rename taxonomy, or reassign product associations.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setNewSubName("");
              setAddModalError("");
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#B89366] to-[#9C7342] hover:from-[#A88255] hover:to-[#8C6332] text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Subcategory</span>
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#EAE2D8]/60 no-scrollbar">
          {CATEGORY_LIST.map((cat) => {
            const isActive = activeCategory === cat.id;
            const count = (subcategoriesMap[cat.id] || []).length;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? "bg-[#231610] text-[#FAF7F3] shadow-sm font-semibold"
                    : "bg-[#FAF7F3] text-[#7A6F68] hover:text-[#231610] hover:bg-[#F3ECE4] border border-[#EAE2D8]"
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                    isActive ? "bg-[#C5A47E] text-[#1F140E]" : "bg-[#EAE2D8] text-[#5A4E46]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Subcategories List for Active Category */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-[#8C7E75] font-semibold uppercase tracking-wider px-2">
            <span>{activeCategoryLabel} Subcategories</span>
            <span>Usage & Actions</span>
          </div>

          {isLoadingSubs ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-[#7A6F68]">
              <Loader2 className="w-6 h-6 animate-spin text-[#B89366]" />
              <span className="text-xs">Loading subcategories...</span>
            </div>
          ) : currentSubcategories.length === 0 ? (
            <div className="p-8 text-center bg-[#FAF7F3] rounded-xl border border-dashed border-[#D8CEBE]">
              <p className="text-xs text-[#7A6F68]">
                No subcategories found for {activeCategoryLabel}.
              </p>
              <button
                type="button"
                onClick={() => {
                  setNewSubName("");
                  setAddModalError("");
                  setIsAddModalOpen(true);
                }}
                className="mt-3 text-xs text-[#9C7342] font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add first subcategory</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#EAE2D8]/60 border border-[#EAE2D8] rounded-xl overflow-hidden bg-white">
              {currentSubcategories.map((sub) => (
                <div
                  key={sub.id || sub.name}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:px-5 hover:bg-[#FAF7F3]/70 transition-colors gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#B89366]" />
                    <span className="text-sm font-semibold text-[#231610]">
                      {sub.name}
                    </span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    {/* Live Product Count Badge */}
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        sub.productCount > 0
                          ? "bg-[#B89366]/15 text-[#9C5A2C] font-semibold border border-[#B89366]/30"
                          : "bg-[#FAF7F3] text-[#8C7E75] border border-[#EAE2D8]"
                      }`}
                    >
                      {sub.productCount} {sub.productCount === 1 ? "product" : "products"}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSub(sub);
                          setEditSubName(sub.name);
                          setEditModalError("");
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-[#D8CEBE] text-xs font-medium text-[#5A4E46] hover:text-[#9C5A2C] hover:bg-[#FAF7F3] transition-colors flex items-center gap-1 cursor-pointer"
                        title="Rename Subcategory"
                      >
                        <Edit2 className="w-3.5 h-3.5 stroke-[1.8]" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setDeletingSub(sub);
                          const otherSubs = currentSubcategories.filter((s) => s.id !== sub.id);
                          setReassignTarget(otherSubs[0]?.name || "");
                          setDeleteModalError("");
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-[#EAE2D8] text-xs font-medium text-[#8C7E75] hover:text-[#6A1A24] hover:bg-[#6A1A24]/10 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Delete Subcategory"
                      >
                        <Trash2 className="w-3.5 h-3.5 stroke-[1.8]" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* OTHER STORE SETTINGS & INTEGRATION CARDS */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Store Information Card */}
        <div className="bg-[#FFFDFB] border border-[#EAE2D8] rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-3 pb-3 border-b border-[#EAE2D8]/60">
            <div className="w-9 h-9 rounded-xl bg-[#B89366]/15 text-[#B89366] flex items-center justify-center">
              <Store className="w-5 h-5 stroke-[1.6]" />
            </div>
            <div>
              <h3 className="font-serif-luxury text-base font-semibold text-[#231610]">
                Store Profile
              </h3>
              <p className="text-[11px] text-[#7A6F68]">Primary business details</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[#8C7E75] block uppercase text-[10px] font-semibold">Store Brand</span>
              <span className="font-semibold text-[#231610] text-sm">Insha Collections</span>
            </div>
            <div>
              <span className="text-[#8C7E75] block uppercase text-[10px] font-semibold">Orders Reception WhatsApp</span>
              <span className="font-mono text-[#231610] font-medium">+91 9618648050</span>
            </div>
            <div>
              <span className="text-[#8C7E75] block uppercase text-[10px] font-semibold">Store Location</span>
              <span className="text-[#231610]">Opp. Minar Function Hall, Chilkalguda, Secunderabad, Telangana 500061</span>
            </div>
          </div>
        </div>

        {/* 2. WhatsApp Cloud API Status */}
        <div className="bg-[#FFFDFB] border border-[#EAE2D8] rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D8]/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#2D5A27]/15 text-[#2D5A27] flex items-center justify-center">
                <MessageSquare className="w-5 h-5 stroke-[1.6]" />
              </div>
              <div>
                <h3 className="font-serif-luxury text-base font-semibold text-[#231610]">
                  WhatsApp Cloud API
                </h3>
                <p className="text-[11px] text-[#7A6F68]">Automated checkout dispatch</p>
              </div>
            </div>
            <span className="text-[10px] bg-[#2D5A27]/15 text-[#2D5A27] font-semibold px-2 py-0.5 rounded-full">
              ACTIVE
            </span>
          </div>

          <div className="space-y-2 text-xs text-[#7A6F68]">
            <p>
              When customers complete the checkout modal, order payload is dispatched directly via Meta WhatsApp Cloud API with product photo and delivery address.
            </p>
            <div className="p-3 bg-[#FAF7F3] rounded-xl border border-[#EAE2D8] font-mono text-[11px] text-[#231610]">
              Mode: Auto (Template + Session fallback)
            </div>
          </div>
        </div>

        {/* 3. AWS S3 Image Storage Card */}
        <div className="bg-[#FFFDFB] border border-[#EAE2D8] rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D8]/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#BA7442]/15 text-[#BA7442] flex items-center justify-center">
                <Cloud className="w-5 h-5 stroke-[1.6]" />
              </div>
              <div>
                <h3 className="font-serif-luxury text-base font-semibold text-[#231610]">
                  AWS S3 Image Storage
                </h3>
                <p className="text-[11px] text-[#7A6F68]">Secure server-side uploads & preservation</p>
              </div>
            </div>
            <span className="text-[10px] bg-[#FAF7F3] border border-[#D8CEBE] text-[#7A6F68] font-semibold px-2 py-0.5 rounded-full">
              S3 BUCKET SET
            </span>
          </div>

          <div className="space-y-2 text-xs text-[#7A6F68]">
            <p>
              Untouched original files are preserved under <code className="text-[#9C5A2C] font-mono text-[11px]">products/&#123;id&#125;/&#123;type&#125;/original/</code> and served with high performance.
            </p>

            <div className="pt-2">
              <span className="text-[10px] uppercase font-semibold text-[#8C7E75] block mb-1">
                Configured S3 Settings:
              </span>
              <div className="p-3 bg-[#1F140E] text-[#FAF7F3] rounded-xl font-mono text-[11px] space-y-0.5">
                <div>AWS_REGION=ap-southeast-2</div>
                <div>AWS_S3_BUCKET_NAME=insha-collection-assets</div>
                <div>AWS_ACCESS_KEY_ID=••••••••••••••••</div>
                <div>AWS_SECRET_ACCESS_KEY=••••••••••••••••</div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Product Image Performance & WebP Optimization Card */}
        <div className="bg-[#FFFDFB] border border-[#EAE2D8] rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D8]/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#C5A47E]/20 text-[#9C5A2C] flex items-center justify-center">
                <Zap className="w-5 h-5 stroke-[1.8]" />
              </div>
              <div>
                <h3 className="font-serif-luxury text-base font-semibold text-[#231610]">
                  Image Performance & WebP
                </h3>
                <p className="text-[11px] text-[#7A6F68]">Sharp 0.35.4 Multi-Resolution Pipeline</p>
              </div>
            </div>
            <span className="text-[10px] bg-[#2D5A27]/15 text-[#2D5A27] font-semibold px-2 py-0.5 rounded-full">
              90%+ COMPRESSION
            </span>
          </div>

          <div className="space-y-3 text-xs text-[#7A6F68]">
            <p>
              Every uploaded image automatically produces 4 responsive WebP derivatives (400w, 800w, 1200w, 1600w) + 20px blur placeholders for instant luxury loading without quality loss.
            </p>

            <div className="p-3 bg-[#FAF7F3] rounded-xl border border-[#EAE2D8] space-y-1.5 text-[11px] text-[#5A4E46]">
              <div className="flex items-center justify-between">
                <span>Storefront Cards:</span>
                <span className="font-semibold text-[#231610]">400w WebP (~35 KB)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Quick View Preview:</span>
                <span className="font-semibold text-[#231610]">800w / 1200w WebP (~110 KB)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Cache Policy:</span>
                <span className="font-mono text-[#9C5A2C]">max-age=31536000, immutable</span>
              </div>
            </div>

            <button
              type="button"
              disabled={isOptimizingImages}
              onClick={handleBatchOptimizeImages}
              className="w-full py-2.5 px-4 rounded-xl bg-[#231610] hover:bg-[#3D261C] text-[#FAF7F3] text-xs font-semibold tracking-wider uppercase transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isOptimizingImages ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#C5A47E]" />
                  <span>Optimizing Catalog Images...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#C5A47E]" />
                  <span>Run Batch Catalog Optimization</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 4. AWS Cognito Auth Card */}
        <div className="bg-[#FFFDFB] border border-[#EAE2D8] rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D8]/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#6A1A24]/10 text-[#6A1A24] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 stroke-[1.6]" />
              </div>
              <div>
                <h3 className="font-serif-luxury text-base font-semibold text-[#231610]">
                  AWS Cognito Authentication
                </h3>
                <p className="text-[11px] text-[#7A6F68]">Enterprise Admin User Pool</p>
              </div>
            </div>
            <span className="text-[10px] bg-[#FAF7F3] border border-[#D8CEBE] text-[#7A6F68] font-semibold px-2 py-0.5 rounded-full">
              {cognitoConfigured ? "COGNITO CONNECTED" : "DEV SESSION READY"}
            </span>
          </div>

          <div className="space-y-2 text-xs text-[#7A6F68]">
            <p>
              Connected to Insha Collections admin user pool in Sydney (ap-southeast-2). Direct username/password authentication is verified via AWS Cognito Identity Provider.
            </p>

            <div className="pt-2">
              <span className="text-[10px] uppercase font-semibold text-[#8C7E75] block mb-1">
                Configured Cognito Pool:
              </span>
              <div className="p-3 bg-[#1F140E] text-[#FAF7F3] rounded-xl font-mono text-[11px] space-y-0.5">
                <div>AWS_COGNITO_REGION=ap-southeast-2</div>
                <div>AWS_COGNITO_USER_POOL_ID=ap-southeast-2_BAyDRrryV</div>
                <div>AWS_COGNITO_CLIENT_ID=1o4lmii74fafsmui9rnpu6em2v</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: ADD SUBCATEGORY MODAL */}
      {/* ========================================================= */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => !isSubmittingAdd && setIsAddModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#FFFDFB] border border-[#EAE2D8] rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D8]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#B89366]/15 text-[#B89366] flex items-center justify-center">
                  <FolderPlus className="w-4 h-4 stroke-[1.8]" />
                </div>
                <h3 className="font-serif-luxury text-lg font-semibold text-[#231610]">
                  ADD SUBCATEGORY
                </h3>
              </div>
              <button
                type="button"
                onClick={() => !isSubmittingAdd && setIsAddModalOpen(false)}
                className="p-1.5 text-[#7A6F68] hover:text-[#231610] rounded-lg hover:bg-[#FAF7F3] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addModalError && (
              <div className="p-3 rounded-xl bg-[#6A1A24]/10 border border-[#6A1A24]/20 flex items-start gap-2.5 text-[#6A1A24] text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{addModalError}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#8C7E75] uppercase tracking-wider">
                Category
              </label>
              <div className="w-full bg-[#FAF7F3] text-[#231610] text-sm px-4 py-2.5 rounded-xl border border-[#EAE2D8] font-medium select-none">
                {activeCategoryLabel}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#231610] uppercase tracking-wider">
                Subcategory Name <span className="text-[#6A1A24]">*</span>
              </label>
              <input
                type="text"
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSubcategory(e);
                  }
                }}
                placeholder="e.g. Bridal Jewellery"
                autoFocus
                className="w-full bg-[#FAF7F3] text-[#231610] text-sm px-4 py-3 rounded-xl border border-[#EAE2D8] focus:border-[#B89366] focus:ring-2 focus:ring-[#C5A47E]/20 focus:outline-none transition-all placeholder:text-[#A89E96]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isSubmittingAdd}
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-[#D8CEBE] text-xs sm:text-sm font-medium text-[#5A4E46] hover:bg-[#F3ECE4] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingAdd}
                onClick={handleAddSubcategory}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#B89366] to-[#9C7342] hover:from-[#A88255] hover:to-[#8C6332] text-white text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmittingAdd ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <span>Add Subcategory</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: EDIT / RENAME SUBCATEGORY MODAL */}
      {/* ========================================================= */}
      {editingSub && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => !isSubmittingEdit && setIsEditingSubModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#FFFDFB] border border-[#EAE2D8] rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D8]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#B89366]/15 text-[#B89366] flex items-center justify-center">
                  <Edit2 className="w-4 h-4 stroke-[1.8]" />
                </div>
                <h3 className="font-serif-luxury text-lg font-semibold text-[#231610]">
                  EDIT SUBCATEGORY
                </h3>
              </div>
              <button
                type="button"
                onClick={() => !isSubmittingEdit && setIsEditingSubModalOpen(false)}
                className="p-1.5 text-[#7A6F68] hover:text-[#231610] rounded-lg hover:bg-[#FAF7F3] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editModalError && (
              <div className="p-3 rounded-xl bg-[#6A1A24]/10 border border-[#6A1A24]/20 flex items-start gap-2.5 text-[#6A1A24] text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{editModalError}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#8C7E75] uppercase tracking-wider">
                Category
              </label>
              <div className="w-full bg-[#FAF7F3] text-[#231610] text-sm px-4 py-2.5 rounded-xl border border-[#EAE2D8] font-medium select-none">
                {CATEGORY_LIST.find((c) => c.id === editingSub.categoryId)?.label || editingSub.categoryId}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#231610] uppercase tracking-wider">
                Subcategory Name <span className="text-[#6A1A24]">*</span>
              </label>
              <input
                type="text"
                value={editSubName}
                onChange={(e) => setEditSubName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleEditSubcategory(e);
                  }
                }}
                placeholder="New subcategory name"
                autoFocus
                className="w-full bg-[#FAF7F3] text-[#231610] text-sm px-4 py-3 rounded-xl border border-[#EAE2D8] focus:border-[#B89366] focus:ring-2 focus:ring-[#C5A47E]/20 focus:outline-none transition-all placeholder:text-[#A89E96]"
              />
            </div>

            {editingSub.productCount > 0 && (
              <div className="p-3 rounded-xl bg-[#FAF4ED] border border-[#B89366]/30 flex items-start gap-2.5 text-[#9C5A2C] text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  <strong>{editingSub.productCount} product(s)</strong> are currently assigned to this subcategory and will be updated automatically.
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isSubmittingEdit}
                onClick={() => setIsEditingSubModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-[#D8CEBE] text-xs sm:text-sm font-medium text-[#5A4E46] hover:bg-[#F3ECE4] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingEdit}
                onClick={handleEditSubcategory}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#B89366] to-[#9C7342] hover:from-[#A88255] hover:to-[#8C6332] text-white text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmittingEdit ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: DELETE / REASSIGN MODAL */}
      {/* ========================================================= */}
      {deletingSub && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => !isSubmittingDelete && setIsDeletingSubModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#FFFDFB] border border-[#EAE2D8] rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D8]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#6A1A24]/10 text-[#6A1A24] flex items-center justify-center">
                  <Trash2 className="w-4 h-4 stroke-[1.8]" />
                </div>
                <h3 className="font-serif-luxury text-lg font-semibold text-[#231610]">
                  DELETE SUBCATEGORY
                </h3>
              </div>
              <button
                type="button"
                onClick={() => !isSubmittingDelete && setIsDeletingSubModalOpen(false)}
                className="p-1.5 text-[#7A6F68] hover:text-[#231610] rounded-lg hover:bg-[#FAF7F3] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {deleteModalError && (
              <div className="p-3 rounded-xl bg-[#6A1A24]/10 border border-[#6A1A24]/20 flex items-start gap-2.5 text-[#6A1A24] text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{deleteModalError}</p>
              </div>
            )}

            {deletingSub.productCount === 0 ? (
              // Case 1: Unused subcategory (0 products)
              <div className="space-y-3">
                <p className="text-sm text-[#5A4E46]">
                  Are you sure you want to delete{" "}
                  <strong className="text-[#231610]">&ldquo;{deletingSub.name}&rdquo;</strong> from{" "}
                  {CATEGORY_LIST.find((c) => c.id === deletingSub.categoryId)?.label}?
                </p>
                <p className="text-xs text-[#8C7E75]">
                  This subcategory is currently not used by any products.
                </p>
              </div>
            ) : (
              // Case 2: In-use subcategory (X products > 0)
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-[#6A1A24]/10 border border-[#6A1A24]/20 space-y-1.5 text-xs text-[#6A1A24]">
                  <div className="flex items-center gap-2 font-semibold">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Delete Protection Active</span>
                  </div>
                  <p>
                    This subcategory is currently used by{" "}
                    <strong>{deletingSub.productCount} product(s)</strong>. Please select a replacement subcategory before deleting it.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#231610] uppercase tracking-wider">
                    Replacement Subcategory <span className="text-[#6A1A24]">*</span>
                  </label>
                  <select
                    value={reassignTarget}
                    onChange={(e) => setReassignTarget(e.target.value)}
                    className="w-full bg-[#FAF7F3] text-[#231610] text-sm px-4 py-3 rounded-xl border border-[#EAE2D8] focus:border-[#B89366] focus:outline-none transition-all cursor-pointer"
                  >
                    {currentSubcategories
                      .filter((s) => s.id !== deletingSub.id)
                      .map((sub) => (
                        <option key={sub.id || sub.name} value={sub.name}>
                          {sub.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isSubmittingDelete}
                onClick={() => setIsDeletingSubModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-[#D8CEBE] text-xs sm:text-sm font-medium text-[#5A4E46] hover:bg-[#F3ECE4] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingDelete}
                onClick={handleDeleteSubcategory}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8C2A34] to-[#6A1A24] hover:from-[#7C1A24] hover:to-[#5A0A14] text-white text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmittingDelete ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : deletingSub.productCount > 0 ? (
                  <span>Reassign & Delete</span>
                ) : (
                  <span>Delete Subcategory</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
