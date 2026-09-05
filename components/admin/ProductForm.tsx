"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Save,
  ArrowLeft,
  Loader2,
  AlertCircle,
  X,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { CATEGORY_SUBCATEGORIES } from "@/data/catalog";
import {
  CreateProductDTO,
  ProductCategory,
  ProductRecord,
  ProductStatus,
  normalizeImageUrl,
} from "@/lib/products/productTypes";
import ImageUploadZone from "./ImageUploadZone";

interface ProductFormProps {
  initialData?: ProductRecord;
  isEditMode?: boolean;
}

const CATEGORY_OPTIONS: { id: ProductCategory; label: string }[] = [
  { id: "jewellery", label: "Jewellery" },
  { id: "korean", label: "Korean Items" },
  { id: "dresses", label: "Readymade Dresses" },
  { id: "materials", label: "Dress Materials" },
  { id: "handlooms", label: "Handlooms" },
  { id: "beauty", label: "Beauty & Salon" },
];

export default function ProductForm({
  initialData,
  isEditMode = false,
}: ProductFormProps) {
  const router = useRouter();

  const [name, setName] = useState(initialData?.name || "");
  const [category, setCategory] = useState<ProductCategory>(
    initialData?.category || "jewellery"
  );
  const [subCategory, setSubCategory] = useState(
    initialData?.subCategory || CATEGORY_SUBCATEGORIES["jewellery"]?.[0] || ""
  );
  const [description, setDescription] = useState(initialData?.description || "");
  const [shortDescription, setShortDescription] = useState(
    initialData?.shortDescription || ""
  );
  const [price, setPrice] = useState<number | string>(initialData?.price ?? "");
  const [salePrice, setSalePrice] = useState<number | string>(
    initialData?.salePrice ?? ""
  );
  const [sku, setSku] = useState(initialData?.sku || "");
  const [stockQuantity, setStockQuantity] = useState<number | string>(
    initialData?.stockQuantity ?? 15
  );
  const [status, setStatus] = useState<ProductStatus>(
    initialData?.status || "Active"
  );
  const [featured, setFeatured] = useState<boolean>(
    initialData?.featured || false
  );
  const [material, setMaterial] = useState(initialData?.material || "");
  const [duration, setDuration] = useState(initialData?.duration || "60 mins");

  // Details / Benefits tag lists
  const [detailsList, setDetailsList] = useState<string[]>(
    initialData?.details || []
  );
  const [newDetailInput, setNewDetailInput] = useState<string>("");

  const [benefitsList, setBenefitsList] = useState<string[]>(
    initialData?.benefits || []
  );
  const [newBenefitInput, setNewBenefitInput] = useState<string>("");

  // Images state: AI Showcase Image + Real Product Images (Normalized)
  const [showcaseImage, setShowcaseImage] = useState<string>(
    initialData?.showcaseImage
      ? typeof initialData.showcaseImage === "string"
        ? normalizeImageUrl(initialData.showcaseImage)
        : normalizeImageUrl(initialData.showcaseImage.url)
      : ""
  );

  const [realImages, setRealImages] = useState<string[]>(
    initialData?.realImages && initialData.realImages.length > 0
      ? initialData.realImages.map(normalizeImageUrl).filter(Boolean)
      : initialData?.images && initialData.images.length > 0
      ? initialData.images.map(normalizeImageUrl).filter(Boolean)
      : initialData?.mainImage
      ? [normalizeImageUrl(initialData.mainImage)]
      : []
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Update subcategories when category changes
  const handleCategoryChange = (newCat: ProductCategory) => {
    setCategory(newCat);
    const availableSubCats = CATEGORY_SUBCATEGORIES[newCat] || [];
    setSubCategory(availableSubCats[0] || "");
  };

  const handleAddDetail = () => {
    if (newDetailInput.trim()) {
      setDetailsList([...detailsList, newDetailInput.trim()]);
      setNewDetailInput("");
    }
  };

  const handleRemoveDetail = (idx: number) => {
    setDetailsList(detailsList.filter((_, i: number) => i !== idx));
  };

  const handleAddBenefit = () => {
    if (newBenefitInput.trim()) {
      setBenefitsList([...benefitsList, newBenefitInput.trim()]);
      setNewBenefitInput("");
    }
  };

  const handleRemoveBenefit = (idx: number) => {
    setBenefitsList(benefitsList.filter((_, i: number) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Validations
    if (!name.trim()) {
      setErrorMessage("Please enter a Product / Service Name.");
      return;
    }
    if (!description.trim()) {
      setErrorMessage("Please provide a product description.");
      return;
    }
    if (price === "" || Number(price) < 0) {
      setErrorMessage("Please enter a valid price (₹).");
      return;
    }
    if (!showcaseImage && realImages.length === 0) {
      setErrorMessage("Please upload at least one image (AI Showcase Image or Real Product Photo).");
      return;
    }

    setIsSubmitting(true);

    try {
      const normShowcase = showcaseImage.trim() ? normalizeImageUrl(showcaseImage.trim()) : undefined;
      const normReal = realImages.map(normalizeImageUrl).filter(Boolean);
      const primaryImage = normShowcase || normReal[0] || "";
      const allRealImages = normReal.length > 0 ? normReal : (primaryImage ? [primaryImage] : []);

      const payload: CreateProductDTO = {
        name: name.trim(),
        category,
        subCategory,
        description: description.trim(),
        shortDescription: shortDescription.trim(),
        price: Number(price),
        salePrice: salePrice ? Number(salePrice) : undefined,
        sku: sku.trim(),
        stockQuantity: Number(stockQuantity) || 0,
        inStock: Number(stockQuantity) > 0 && status !== "Out of Stock",
        status,
        featured,
        showcaseImage: normShowcase,
        realImages: allRealImages,
        mainImage: primaryImage,
        images: allRealImages,
        material: material.trim() || undefined,
        details: detailsList.length > 0 ? detailsList : undefined,
        duration: category === "beauty" ? duration.trim() : undefined,
        benefits: category === "beauty" && benefitsList.length > 0 ? benefitsList : undefined,
      };

      const url = isEditMode && initialData?.id
        ? `/api/admin/products/${initialData.id}`
        : "/api/admin/products";

      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save product.");
      }

      setSuccessMessage(
        isEditMode
          ? "Product updated successfully!"
          : "Product created and published to store catalog!"
      );

      setTimeout(() => {
        router.push("/admin/products");
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving product";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBeauty = category === "beauty";

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
      {/* Top Header & Navigation Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAE2D8]">
        <div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 text-xs text-[#7A6F68] hover:text-[#9C5A2C] transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Products</span>
          </Link>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-semibold text-[#231610] tracking-tight">
            {isEditMode ? `Edit Product: ${initialData?.name}` : "Add New Product"}
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6F68] mt-1">
            {isBeauty
              ? "Create or modify salon & beauty service offerings."
              : "Add or update fashion and luxury collection inventory."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="px-4 py-2.5 rounded-xl border border-[#D8CEBE] text-xs sm:text-sm font-medium text-[#5A4E46] hover:bg-[#F3ECE4] transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#B89366] to-[#9C7342] hover:from-[#A88255] hover:to-[#8C6332] text-white text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>SAVING...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEditMode ? "SAVE CHANGES" : "PUBLISH PRODUCT"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-[#6A1A24]/10 border border-[#6A1A24]/20 flex items-start gap-3 text-[#6A1A24] text-xs sm:text-sm animate-fadeIn">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{errorMessage}</p>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-[#2D5A27]/10 border border-[#2D5A27]/20 flex items-start gap-3 text-[#2D5A27] text-xs sm:text-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{successMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Core Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Basic Information Card */}
          <div className="bg-[#FFFDFB] border border-[#EAE2D8] rounded-2xl p-5 sm:p-7 space-y-5 shadow-xs">
            <h2 className="font-serif-luxury text-base sm:text-lg font-semibold text-[#231610] pb-2 border-b border-[#EAE2D8]/60">
              Basic Details
            </h2>

            {/* Product Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#231610] uppercase tracking-wider">
                {isBeauty ? "Service Name" : "Product Name"}{" "}
                <span className="text-[#6A1A24]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={
                  isBeauty
                    ? "e.g. Royal Hydrating Glow Facial"
                    : "e.g. Dazzling Kundan Pearl Necklace Set"
                }
                className="w-full bg-[#FAF7F3] text-[#231610] text-sm px-4 py-3 rounded-xl border border-[#EAE2D8] focus:border-[#B89366] focus:ring-2 focus:ring-[#C5A47E]/20 focus:outline-none transition-all placeholder:text-[#A89E96]"
                required
              />
            </div>

            {/* Category & Subcategory Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#231610] uppercase tracking-wider">
                  Category <span className="text-[#6A1A24]">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) =>
                    handleCategoryChange(e.target.value as ProductCategory)
                  }
                  className="w-full bg-[#FAF7F3] text-[#231610] text-sm px-4 py-3 rounded-xl border border-[#EAE2D8] focus:border-[#B89366] focus:outline-none transition-all"
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategory */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#231610] uppercase tracking-wider">
                  Subcategory
                </label>
                <select
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  className="w-full bg-[#FAF7F3] text-[#231610] text-sm px-4 py-3 rounded-xl border border-[#EAE2D8] focus:border-[#B89366] focus:outline-none transition-all"
                >
                  {(CATEGORY_SUBCATEGORIES[category] || []).map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Full Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#231610] uppercase tracking-wider">
                Full Description <span className="text-[#6A1A24]">*</span>
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide comprehensive details on craftsmanship, styling tips, care instructions, and heritage appeal..."
                className="w-full bg-[#FAF7F3] text-[#231610] text-sm p-4 rounded-xl border border-[#EAE2D8] focus:border-[#B89366] focus:ring-2 focus:ring-[#C5A47E]/20 focus:outline-none transition-all placeholder:text-[#A89E96]"
                required
              />
            </div>

            {/* Short Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#231610] uppercase tracking-wider">
                Short Description / Tagline
              </label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Brief summary displayed on quick cards and WhatsApp summaries..."
                className="w-full bg-[#FAF7F3] text-[#231610] text-sm px-4 py-3 rounded-xl border border-[#EAE2D8] focus:border-[#B89366] focus:outline-none transition-all placeholder:text-[#A89E96]"
              />
            </div>
          </div>

          {/* 2. Media Upload Card */}
          <div className="bg-[#FFFDFB] border border-[#EAE2D8] rounded-2xl p-5 sm:p-7 space-y-5 shadow-xs">
            <h2 className="font-serif-luxury text-base sm:text-lg font-semibold text-[#231610] pb-2 border-b border-[#EAE2D8]/60">
              Product Images (AWS S3 Storage)
            </h2>
            <ImageUploadZone
              showcaseImage={showcaseImage}
              realImages={realImages}
              category={category}
              productId={initialData?.id || "new"}
              onShowcaseImageChange={setShowcaseImage}
              onRealImagesChange={setRealImages}
            />
          </div>

          {/* 3. Physical Attributes or Beauty Attributes */}
          <div className="bg-[#FFFDFB] border border-[#EAE2D8] rounded-2xl p-5 sm:p-7 space-y-5 shadow-xs">
            <h2 className="font-serif-luxury text-base sm:text-lg font-semibold text-[#231610] pb-2 border-b border-[#EAE2D8]/60">
              {isBeauty ? "Service Specifics" : "Specifications & Features"}
            </h2>

            {isBeauty ? (
              /* Beauty Specific Fields */
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#231610] uppercase tracking-wider">
                    Service Duration
                  </label>
                  <div className="relative flex items-center">
                    <Clock className="w-4 h-4 text-[#8C7E75] absolute left-3.5 pointer-events-none" />
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g. 45 mins, 60 mins, 90 mins"
                      className="w-full bg-[#FAF7F3] text-[#231610] text-sm pl-10 pr-4 py-3 rounded-xl border border-[#EAE2D8] focus:border-[#B89366] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Benefits List */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#231610] uppercase tracking-wider">
                    Treatment Benefits
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newBenefitInput}
                      onChange={(e) => setNewBenefitInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddBenefit();
                        }
                      }}
                      placeholder="e.g. Deep pore cleansing & hydration"
                      className="flex-1 bg-[#FAF7F3] text-[#231610] text-sm px-4 py-2.5 rounded-xl border border-[#EAE2D8] focus:border-[#B89366] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddBenefit}
                      className="px-4 py-2.5 rounded-xl bg-[#231610] text-[#FAF7F3] text-xs font-medium hover:bg-[#3D281D] transition-colors cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {benefitsList.map((ben, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 bg-[#F6EFE7] border border-[#EAE2D8] px-3 py-1 rounded-full text-xs text-[#231610]"
                      >
                        <span>{ben}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveBenefit(idx)}
                          className="hover:text-[#6A1A24] cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Physical Products Specifics */
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#231610] uppercase tracking-wider">
                    Material / Fabric Composition
                  </label>
                  <input
                    type="text"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    placeholder="e.g. 18k Gold Plated Brass, Pure Mulberry Silk, Stainless Steel"
                    className="w-full bg-[#FAF7F3] text-[#231610] text-sm px-4 py-3 rounded-xl border border-[#EAE2D8] focus:border-[#B89366] focus:outline-none"
                  />
                </div>

                {/* Details Highlights */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#231610] uppercase tracking-wider">
                    Feature Bullet Highlights
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newDetailInput}
                      onChange={(e) => setNewDetailInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddDetail();
                        }
                      }}
                      placeholder="e.g. Anti-tarnish waterproof coating, Handcrafted in Jaipur"
                      className="flex-1 bg-[#FAF7F3] text-[#231610] text-sm px-4 py-2.5 rounded-xl border border-[#EAE2D8] focus:border-[#B89366] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddDetail}
                      className="px-4 py-2.5 rounded-xl bg-[#231610] text-[#FAF7F3] text-xs font-medium hover:bg-[#3D281D] transition-colors cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {detailsList.map((dt, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 bg-[#F6EFE7] border border-[#EAE2D8] px-3 py-1 rounded-full text-xs text-[#231610]"
                      >
                        <span>{dt}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDetail(idx)}
                          className="hover:text-[#6A1A24] cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Pricing, Inventory, & Status Sidebar */}
        <div className="space-y-6">
          {/* 1. Pricing Card */}
          <div className="bg-[#FFFDFB] border border-[#EAE2D8] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
            <h2 className="font-serif-luxury text-base font-semibold text-[#231610] pb-2 border-b border-[#EAE2D8]/60">
              Pricing
            </h2>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#231610] uppercase tracking-wider">
                Price (₹) <span className="text-[#6A1A24]">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-[#8C7E75] font-semibold text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="2499"
                  className="w-full bg-[#FAF7F3] text-[#231610] text-sm pl-8 pr-4 py-3 rounded-xl border border-[#EAE2D8] focus:border-[#B89366] focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#231610] uppercase tracking-wider">
                Sale / Original Price (₹)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-[#8C7E75] font-semibold text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  placeholder="3199 (Strikethrough)"
                  className="w-full bg-[#FAF7F3] text-[#231610] text-sm pl-8 pr-4 py-3 rounded-xl border border-[#EAE2D8] focus:border-[#B89366] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 2. Inventory & SKU Card */}
          <div className="bg-[#FFFDFB] border border-[#EAE2D8] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
            <h2 className="font-serif-luxury text-base font-semibold text-[#231610] pb-2 border-b border-[#EAE2D8]/60">
              Inventory & Tracking
            </h2>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#231610] uppercase tracking-wider">
                SKU / Code
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. INSHA-JWL-101"
                className="w-full bg-[#FAF7F3] text-[#231610] text-sm px-4 py-2.5 rounded-xl border border-[#EAE2D8] focus:border-[#B89366] focus:outline-none"
              />
            </div>

            {!isBeauty && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#231610] uppercase tracking-wider">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  placeholder="25"
                  className="w-full bg-[#FAF7F3] text-[#231610] text-sm px-4 py-2.5 rounded-xl border border-[#EAE2D8] focus:border-[#B89366] focus:outline-none"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#231610] uppercase tracking-wider">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProductStatus)}
                className="w-full bg-[#FAF7F3] text-[#231610] text-sm px-4 py-2.5 rounded-xl border border-[#EAE2D8] focus:border-[#B89366] focus:outline-none"
              >
                <option value="Active">Active (Visible)</option>
                <option value="Draft">Draft (Hidden)</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 rounded border-[#D8CEBE] text-[#9C5A2C] focus:ring-[#C5A47E] accent-[#9C5A2C] cursor-pointer"
                />
                <span className="text-xs font-medium text-[#231610]">
                  Featured Collection Item
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
