"use client";

import React, { useState } from "react";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";

interface DeleteProductModalProps {
  isOpen: boolean;
  productName: string;
  productId: string;
  onClose: () => void;
  onConfirmDelete: (id: string) => Promise<void>;
}

export default function DeleteProductModal({
  isOpen,
  productName,
  productId,
  onClose,
  onConfirmDelete,
}: DeleteProductModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirmDelete(productId);
      onClose();
    } catch (err) {
      console.error("Error deleting product:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="w-full max-w-md bg-[#FAF7F3] border border-[#EAE2D8] rounded-2xl p-6 sm:p-7 shadow-2xl relative overflow-hidden transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 text-[#8C7E75] hover:text-[#231610] p-1.5 rounded-lg hover:bg-[#F3ECE4] transition-colors cursor-pointer disabled:opacity-50"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning Icon Badge */}
        <div className="w-12 h-12 rounded-full bg-[#6A1A24]/10 border border-[#6A1A24]/20 flex items-center justify-center text-[#6A1A24] mb-4">
          <AlertTriangle className="w-6 h-6 stroke-[1.8]" />
        </div>

        {/* Title & Warning Text */}
        <h3
          id="delete-dialog-title"
          className="font-serif-luxury text-xl font-semibold text-[#231610] tracking-tight mb-2"
        >
          Delete Product?
        </h3>

        <p className="text-xs sm:text-sm text-[#7A6F68] leading-relaxed mb-6">
          Are you sure you want to delete <span className="font-semibold text-[#231610]">&quot;{productName}&quot;</span>? This action cannot be undone. The product will be permanently removed from your store catalog.
        </p>

        {/* Actions Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl border border-[#D8CEBE] text-xs sm:text-sm font-medium text-[#5A4E46] hover:bg-[#F3ECE4] hover:text-[#231610] transition-colors cursor-pointer disabled:opacity-50"
          >
            CANCEL
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-xl bg-[#6A1A24] hover:bg-[#54121B] text-white text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all shadow-sm hover:shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>DELETING...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>DELETE PRODUCT</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
