"use client";

import React from "react";
import ProductForm from "@/components/admin/ProductForm";

export default function AddProductPage() {
  return (
    <div className="animate-fadeIn">
      <ProductForm isEditMode={false} />
    </div>
  );
}
