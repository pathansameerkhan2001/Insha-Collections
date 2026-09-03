"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeatureBar from "@/components/FeatureBar";
import CategoryGrid from "@/components/CategoryGrid";
import ShopByCategory from "@/components/ShopByCategory";
import Footer from "@/components/Footer";
import CartDrawer, { CartEntry } from "@/components/CartDrawer";
import CheckoutModal from "@/components/CheckoutModal";
import WishlistDrawer from "@/components/WishlistDrawer";
import StoreLocatorModal from "@/components/StoreLocatorModal";
import AboutUsModal from "@/components/AboutUsModal";
import {
  ProductItem,
  JEWELLERY_PRODUCTS,
  KOREAN_PRODUCTS,
  DRESSES_PRODUCTS,
  MATERIALS_PRODUCTS,
  HANDLOOM_PRODUCTS,
} from "@/data/catalog";

const ALL_PRODUCTS: ProductItem[] = [
  ...JEWELLERY_PRODUCTS,
  ...KOREAN_PRODUCTS,
  ...DRESSES_PRODUCTS,
  ...MATERIALS_PRODUCTS,
  ...HANDLOOM_PRODUCTS,
];

export default function Home() {
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [wishlistIds, setWishlistIds] = useState<Record<string, boolean>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isStoreLocatorOpen, setIsStoreLocatorOpen] = useState(false);
  const [isAboutUsOpen, setIsAboutUsOpen] = useState(false);

  // Active Category & Subcategory Filter State
  const [activeCategory, setActiveCategory] = useState<string>("jewellery");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("All");

  // Cart operations
  const handleAddToCart = (product: ProductItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateCartQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartEntry[]
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Wishlist operations
  const handleToggleWishlist = (productId: string) => {
    setWishlistIds((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const handleMoveWishlistToCart = (product: ProductItem) => {
    handleAddToCart(product);
    handleToggleWishlist(product.id);
  };

  // Category navigation from Header, Sidebar, and CategoryGrid
  const handleSelectCategory = (categoryId: string, subCategory: string = "All") => {
    setActiveCategory(categoryId);
    setSelectedSubCategory(subCategory);
    if (typeof window !== "undefined") {
      const elem = document.getElementById("shop-by-category");
      if (elem) {
        elem.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  // Scroll to Footer for Contact Us
  const handleOpenContactUs = () => {
    if (typeof window !== "undefined") {
      const elem = document.querySelector("footer");
      if (elem) {
        elem.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistedProducts = ALL_PRODUCTS.filter((p) => wishlistIds[p.id]);

  return (
    <main className="min-h-screen flex flex-col bg-[#FAF7F3]">
      <Header
        wishlistCount={wishlistedProducts.length}
        cartCount={totalCartCount}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onSelectCategory={handleSelectCategory}
        onOpenStoreLocator={() => setIsStoreLocatorOpen(true)}
        onOpenAboutUs={() => setIsAboutUsOpen(true)}
        onOpenContactUs={handleOpenContactUs}
      />

      <HeroSection />
      <FeatureBar />

      <CategoryGrid onSelectCategory={handleSelectCategory} />

      <ShopByCategory
        activeCategory={activeCategory}
        selectedSubCategory={selectedSubCategory}
        onTabChange={(tab) => {
          setActiveCategory(tab);
          setSelectedSubCategory("All");
        }}
        onSubCategoryChange={(sub) => setSelectedSubCategory(sub)}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
        wishlistState={wishlistIds}
      />

      <Footer />

      {/* Cart & Wishlist Drawers */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* WhatsApp Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onBackToCart={() => {
          setIsCheckoutOpen(false);
          setIsCartOpen(true);
        }}
        onClearCart={() => setCart([])}
      />

      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistItems={wishlistedProducts}
        onRemoveFromWishlist={handleToggleWishlist}
        onMoveToCart={handleMoveWishlistToCart}
      />

      {/* Store Locator & About Us Modals */}
      <StoreLocatorModal
        isOpen={isStoreLocatorOpen}
        onClose={() => setIsStoreLocatorOpen(false)}
      />

      <AboutUsModal
        isOpen={isAboutUsOpen}
        onClose={() => setIsAboutUsOpen(false)}
      />
    </main>
  );
}
