"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  UploadCloud,
  X,
  RefreshCw,
  Plus,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Sparkles,
  Camera,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { normalizeImageUrl, LUXURY_BLUR_DATA_URL } from "@/lib/products/productTypes";

interface ImageUploadZoneProps {
  showcaseImage: string;
  realImages: string[];
  category: string;
  productId?: string;
  onShowcaseImageChange: (url: string) => void;
  onRealImagesChange: (urls: string[]) => void;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".heic",
  ".heif",
  ".webp",
  ".JPG",
  ".JPEG",
  ".PNG",
  ".HEIC",
  ".HEIF",
  ".WEBP",
];

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/heic",
  "image/heif",
  "image/webp",
  "application/octet-stream",
];

export default function ImageUploadZone({
  showcaseImage,
  realImages = [],
  category = "jewellery",
  productId = "new",
  onShowcaseImageChange,
  onRealImagesChange,
}: ImageUploadZoneProps) {
  const [isUploadingShowcase, setIsUploadingShowcase] = useState(false);
  const [isUploadingReal, setIsUploadingReal] = useState(false);
  const [replacingRealIndex, setReplacingRealIndex] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadNotice, setUploadNotice] = useState("");
  const [isDraggingShowcase, setIsDraggingShowcase] = useState(false);
  const [isDraggingReal, setIsDraggingReal] = useState(false);

  const showcaseInputRef = useRef<HTMLInputElement>(null);
  const realInputRef = useRef<HTMLInputElement>(null);
  const replaceRealInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const name = file.name.toLowerCase();
    const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext.toLowerCase()));
    const hasValidMime = ALLOWED_MIME_TYPES.includes(file.type.toLowerCase());

    if (!hasValidExt && !hasValidMime) {
      return `Unsupported format for "${file.name}". Supported formats: JPG, JPEG, PNG, HEIC, HEIF.`;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `"${file.name}" exceeds 5MB size limit (${(file.size / (1024 * 1024)).toFixed(2)}MB).`;
    }

    return null;
  };

  const uploadFile = async (
    file: File,
    imageType: "showcase" | "real"
  ): Promise<{ url: string; isS3: boolean; message?: string } | null> => {
    const validationError = validateFile(file);
    if (validationError) {
      setErrorMessage(validationError);
      return null;
    }

    setErrorMessage("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);
    formData.append("productId", productId);
    formData.append("imageType", imageType);

    try {
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to upload image to AWS S3.");
      }

      if (data.message) {
        setUploadNotice(data.message);
      }

      return {
        url: data.url,
        isS3: data.isS3,
        message: data.message,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setErrorMessage(msg);
      return null;
    }
  };

  // 1. AI Showcase Image handlers
  const handleShowcaseFileSelect = async (file: File) => {
    setIsUploadingShowcase(true);
    try {
      const res = await uploadFile(file, "showcase");
      if (res && res.url) {
        onShowcaseImageChange(res.url);
      }
    } finally {
      setIsUploadingShowcase(false);
    }
  };

  // 2. Real Product Images handlers
  const handleRealFilesSelect = async (files: FileList) => {
    setIsUploadingReal(true);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const res = await uploadFile(files[i], "real");
        if (res && res.url) {
          newUrls.push(res.url);
        }
      }
      if (newUrls.length > 0) {
        onRealImagesChange([...realImages, ...newUrls]);
      }
    } finally {
      setIsUploadingReal(false);
    }
  };

  // 3. Replace single real image
  const handleReplaceRealFileSelect = async (file: File) => {
    if (replacingRealIndex === null) return;
    setIsUploadingReal(true);
    try {
      const res = await uploadFile(file, "real");
      if (res && res.url) {
        const updated = [...realImages];
        updated[replacingRealIndex] = res.url;
        onRealImagesChange(updated);
      }
    } finally {
      setIsUploadingReal(false);
      setReplacingRealIndex(null);
    }
  };

  const handleRemoveRealImage = (indexToRemove: number) => {
    onRealImagesChange(realImages.filter((_, idx) => idx !== indexToRemove));
  };

  const handleMoveRealImage = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= realImages.length) return;
    const updated = [...realImages];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    onRealImagesChange(updated);
  };

  const resolvedShowcaseUrl = normalizeImageUrl(showcaseImage);

  return (
    <div className="space-y-6">
      {/* Format Notice Banner */}
      <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#F6EFE7] border border-[#EAE2D8] text-xs text-[#5A4E46]">
        <span className="font-medium text-[#231610]">Supported formats:</span>
        <span className="font-semibold text-[#9C5A2C] tracking-wide">
          JPG, JPEG, PNG, HEIC, HEIF (Max 5MB)
        </span>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-[#6A1A24]/10 border border-[#6A1A24]/20 flex items-start gap-2.5 text-[#6A1A24] text-xs animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="flex-1">{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage("")}
            className="text-[#6A1A24] hover:opacity-75 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Upload Success Notice */}
      {uploadNotice && (
        <div className="p-3 rounded-xl bg-[#2D5A27]/10 border border-[#2D5A27]/20 flex items-center justify-between text-[#2D5A27] text-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2D5A27]" />
            <span>{uploadNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setUploadNotice("")}
            className="text-[#2D5A27] hover:opacity-75 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: AI SHOWCASE IMAGE                                              */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F3] border border-[#EAE2D8] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#C5A47E]/20 flex items-center justify-center text-[#9C5A2C]">
              <Sparkles className="w-3.5 h-3.5 stroke-[2]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#231610] uppercase tracking-wider">
                AI Showcase Image
              </label>
            </div>
          </div>
          <span className="text-[11px] text-[#8C7E75]">
            Storefront Product Card Display
          </span>
        </div>

        <p className="text-xs text-[#7A6F68] leading-relaxed">
          Polished hero photograph displayed on the main storefront product cards. Clean image with no text overlays or watermarks. If omitted, the storefront card gracefully falls back to the first Real Product Image.
        </p>

        <input
          type="file"
          ref={showcaseInputRef}
          accept="image/jpeg,image/png,image/heic,image/heif,image/webp,.jpg,.jpeg,.png,.heic,.heif,.webp,.JPG,.JPEG,.PNG,.HEIC,.HEIF,.WEBP"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleShowcaseFileSelect(e.target.files[0]);
            }
          }}
        />

        {resolvedShowcaseUrl ? (
          /* Preview State */
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-1">
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-xl overflow-hidden border border-[#EAE2D8] bg-white shadow-sm group shrink-0">
              <Image
                src={resolvedShowcaseUrl}
                alt="AI Showcase Image Preview"
                fill
                placeholder="blur"
                blurDataURL={LUXURY_BLUR_DATA_URL}
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="192px"
              />
              <div className="absolute top-2 left-2 bg-[#231610]/85 text-white text-[9px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider backdrop-blur-xs flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-[#E0C097]" />
                <span>AI Showcase</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => showcaseInputRef.current?.click()}
                  disabled={isUploadingShowcase}
                  className="px-3.5 py-2 rounded-xl bg-white border border-[#D8CEBE] hover:border-[#B89366] text-xs font-semibold text-[#231610] hover:text-[#9C5A2C] transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Replace AI Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => onShowcaseImageChange("")}
                  disabled={isUploadingShowcase}
                  className="px-3.5 py-2 rounded-xl bg-[#6A1A24]/10 hover:bg-[#6A1A24] text-xs font-semibold text-[#6A1A24] hover:text-white transition-all border border-[#6A1A24]/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Remove AI Image</span>
                </button>
              </div>
              <p className="text-[11px] text-[#8C7E75]">
                Stored in: <code className="text-[#9C5A2C] bg-white px-1.5 py-0.5 rounded border border-[#EAE2D8]">products/{productId}/showcase/</code>
              </p>
            </div>
          </div>
        ) : (
          /* Dropzone State */
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingShowcase(true);
            }}
            onDragLeave={() => setIsDraggingShowcase(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingShowcase(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleShowcaseFileSelect(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => showcaseInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[140px] ${
              isDraggingShowcase
                ? "border-[#B89366] bg-[#C5A47E]/15"
                : "border-[#D8CEBE] hover:border-[#B89366] bg-white hover:bg-[#FDFBFA]"
            }`}
          >
            {isUploadingShowcase ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 text-[#B89366] animate-spin" />
                <span className="text-xs font-medium text-[#7A6F68]">
                  Uploading AI showcase image to AWS S3...
                </span>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-[#C5A47E]/15 flex items-center justify-center text-[#B89366] mb-2">
                  <UploadCloud className="w-5 h-5 stroke-[1.8]" />
                </div>
                <div className="text-xs font-semibold text-[#231610]">
                  Click or drag & drop AI Showcase Image
                </div>
                <div className="text-[11px] text-[#8C7E75] mt-0.5">
                  JPG, JPEG, PNG, HEIC (Max 5MB)
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: REAL PRODUCT IMAGES                                            */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F3] border border-[#EAE2D8] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#231610]/10 flex items-center justify-center text-[#231610]">
              <Camera className="w-3.5 h-3.5 stroke-[2]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#231610] uppercase tracking-wider">
                Real Product Images ({realImages.length})
              </label>
            </div>
          </div>
          <span className="text-[11px] text-[#8C7E75]">
            Quick View Gallery Photographs
          </span>
        </div>

        <p className="text-xs text-[#7A6F68] leading-relaxed">
          Actual product photographs uploaded for customer Quick View. Customers can inspect these real photos in high detail. If no AI image is provided, the first photo here becomes the storefront card image.
        </p>

        {/* Input for multiple real files */}
        <input
          type="file"
          ref={realInputRef}
          multiple
          accept="image/jpeg,image/png,image/heic,image/heif,image/webp,.jpg,.jpeg,.png,.heic,.heif,.webp,.JPG,.JPEG,.PNG,.HEIC,.HEIF,.WEBP"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleRealFilesSelect(e.target.files);
            }
          }}
        />

        {/* Input for single replacement */}
        <input
          type="file"
          ref={replaceRealInputRef}
          accept="image/jpeg,image/png,image/heic,image/heif,image/webp,.jpg,.jpeg,.png,.heic,.heif,.webp,.JPG,.JPEG,.PNG,.HEIC,.HEIF,.WEBP"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleReplaceRealFileSelect(e.target.files[0]);
            }
          }}
        />

        {/* Real Images Grid */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingReal(true);
          }}
          onDragLeave={() => setIsDraggingReal(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDraggingReal(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              handleRealFilesSelect(e.dataTransfer.files);
            }
          }}
          className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-3 rounded-xl border transition-all ${
            isDraggingReal
              ? "border-[#B89366] bg-[#C5A47E]/10"
              : "border-transparent bg-transparent"
          }`}
        >
          {realImages.map((imgUrl, index) => {
            const normalizedUrl = normalizeImageUrl(imgUrl);
            return (
              <div
                key={imgUrl + index}
                className="relative aspect-square rounded-xl overflow-hidden border border-[#EAE2D8] bg-white shadow-xs group"
              >
                <Image
                  src={normalizedUrl}
                  alt={`Real Product Photo ${index + 1}`}
                  fill
                  placeholder="blur"
                  blurDataURL={LUXURY_BLUR_DATA_URL}
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, 20vw"
                />

                {/* Top Tag */}
                <div className="absolute top-1.5 left-1.5 bg-[#231610]/85 text-white text-[9px] px-1.5 py-0.5 rounded font-semibold backdrop-blur-xs">
                  {index === 0 ? "Photo 1 (Primary)" : `Photo ${index + 1}`}
                </div>

                {/* Action Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                  {/* Top Actions: Reorder */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMoveRealImage(index, index - 1)}
                          className="w-5 h-5 rounded-md bg-white/90 text-[#231610] flex items-center justify-center hover:bg-white shadow-xs cursor-pointer"
                          title="Move left"
                        >
                          <ArrowLeft className="w-3 h-3" />
                        </button>
                      )}
                      {index < realImages.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMoveRealImage(index, index + 1)}
                          className="w-5 h-5 rounded-md bg-white/90 text-[#231610] flex items-center justify-center hover:bg-white shadow-xs cursor-pointer"
                          title="Move right"
                        >
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveRealImage(index)}
                      className="w-6 h-6 rounded-full bg-[#6A1A24] text-white flex items-center justify-center hover:bg-[#54121B] shadow-sm cursor-pointer"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Bottom Action: Replace */}
                  <button
                    type="button"
                    onClick={() => {
                      setReplacingRealIndex(index);
                      replaceRealInputRef.current?.click();
                    }}
                    className="w-full py-1 rounded-md bg-white/90 hover:bg-white text-[10px] font-semibold text-[#231610] flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    <span>Replace</span>
                  </button>
                </div>
              </div>
            );
          })}

          {/* + Add Real Images Button */}
          <button
            type="button"
            onClick={() => realInputRef.current?.click()}
            disabled={isUploadingReal}
            className="aspect-square rounded-xl border-2 border-dashed border-[#D8CEBE] hover:border-[#B89366] bg-white hover:bg-[#F6EFE7] flex flex-col items-center justify-center gap-1.5 text-[#7A6F68] hover:text-[#9C5A2C] transition-all cursor-pointer disabled:opacity-50 min-h-[100px]"
          >
            {isUploadingReal ? (
              <Loader2 className="w-5 h-5 text-[#B89366] animate-spin" />
            ) : (
              <>
                <div className="w-8 h-8 rounded-full bg-[#C5A47E]/15 flex items-center justify-center text-[#B89366]">
                  <Plus className="w-4 h-4 stroke-[2]" />
                </div>
                <span className="text-xs font-semibold">+ Add Photos</span>
                <span className="text-[9px] text-[#8C7E75]">JPG, PNG, HEIC</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
