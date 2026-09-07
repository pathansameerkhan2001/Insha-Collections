"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";
import { ProductRecord } from "@/lib/products/productTypes";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";

export default function EditProductPage() {
  const params = useParams();
  const id = params?.id as string;

  const [product, setProduct] = useState<ProductRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!id) return;

    async function loadProduct() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/admin/products/${id}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        const data = await res.json();

        if (!res.ok || !data.success || !data.product) {
          throw new Error(data.error || "Product not found");
        }

        setProduct(data.product);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load product";
        setErrorMsg(msg);
      } finally {
        setIsLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  if (isLoading) {
    return (
      <div className="bg-[#FFFDFB] border border-[#EAE2D8] rounded-2xl p-16 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#B89366] animate-spin" />
        <span className="text-xs font-serif-luxury tracking-widest text-[#7A6F68] uppercase">
          Loading Product Data...
        </span>
      </div>
    );
  }

  if (errorMsg || !product) {
    return (
      <div className="bg-[#FFFDFB] border border-[#EAE2D8] rounded-2xl p-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#6A1A24]/10 text-[#6A1A24] flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6 stroke-[1.6]" />
        </div>
        <h2 className="font-serif-luxury text-xl font-semibold text-[#231610]">
          Product Not Found
        </h2>
        <p className="text-xs text-[#7A6F68] max-w-sm mx-auto">
          {errorMsg || "The product you requested could not be located in the inventory."}
        </p>
        <div className="pt-2">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#231610] text-[#FAF7F3] text-xs font-medium hover:bg-[#3D281D] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Products</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <ProductForm initialData={product} isEditMode={true} />
    </div>
  );
}
