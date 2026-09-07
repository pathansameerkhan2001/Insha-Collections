"use client";

import React, { useState, useEffect } from "react";
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
import SearchModal from "@/components/SearchModal";
import ProductQuickViewModal from "@/components/ProductQuickViewModal";
import {
  ProductItem,
  ServiceItem,
  JEWELLERY_PRODUCTS,
  KOREAN_PRODUCTS,
  DRESSES_PRODUCTS,
  MATERIALS_PRODUCTS,
  HANDLOOM_PRODUCTS,
  BEAUTY_SERVICES,
} from "@/data/catalog";
import { ProductRecord, getStorefrontImageUrl } from "@/lib/products/productTypes";

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
  const [allProductsList, setAllProductsList] = useState<ProductItem[]>(ALL_PRODUCTS);
  const [beautyServicesList, setBeautyServicesList] = useState<ServiceItem[]>(BEAUTY_SERVICES);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isStoreLocatorOpen, setIsStoreLocatorOpen] = useState(false);
  const [isAboutUsOpen, setIsAboutUsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [directCheckoutItems, setDirectCheckoutItems] = useState<CartEntry[]>([]);
  const [searchQuickViewProduct, setSearchQuickViewProduct] = useState<ProductItem | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/products", {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.products && Array.isArray(data.products) && data.products.length > 0) {
          const physical: ProductItem[] = [];
          const services: ServiceItem[] = [];

          for (const item of data.products) {
            if (item.category === "beauty") {
              services.push({
                id: item.id,
                name: item.name,
                category: "beauty",
                subCategory: item.subCategory,
                price: item.price,
                duration: item.duration || "60 mins",
                rating: item.rating || 4.8,
                reviewsCount: item.reviewsCount || 50,
                badge: item.badge || { text: "POPULAR", type: "gold" },
                image: item.mainImage || item.image,
                description: item.description,
                benefits: item.benefits || ["Professional salon care", "Premium organic formulations"],
              });
            } else {
              const storefrontImg = getStorefrontImageUrl(item, 400);
              const realImgs =
                item.realImages && item.realImages.length > 0
                  ? item.realImages
                  : item.images && item.images.length > 0
                  ? item.images
                  : [item.mainImage || item.image];

              physical.push({
                id: item.id,
                name: item.name,
                category: item.category as ProductItem["category"],
                subCategory: item.subCategory,
                price: item.price,
                originalPrice: item.salePrice,
                rating: item.rating || 4.8,
                reviewsCount: item.reviewsCount || 80,
                badge: item.badge || { text: "NEW ARRIVAL", type: "gold" },
                image: storefrontImg,
                showcaseImage: item.showcaseImage,
                realImages: realImgs,
                description: item.description,
                inStock: item.inStock ?? true,
                material: item.material,
                details: item.details,
              });
            }
          }

          if (physical.length > 0) {
            setAllProductsList(physical);
          }
          if (services.length > 0) {
            setBeautyServicesList(services);
          }
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.warn("Could not fetch latest products:", err);
        }
      });

    return () => {
      controller.abort();
    };
  }, []);

  // Active Category & Subcategory Filter State
  const [activeCategory, setActiveCategory] = useState<string>("jewellery");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("All");

  // Cart operations
  const handleAddToCart = (product: ProductItem, qty: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [...prev, { product, quantity: qty }];
    });
  };

  // Buy Now direct checkout flow (doesn't overwrite existing cart)
  const handleBuyNow = (product: ProductItem, qty: number = 1) => {
    setDirectCheckoutItems([{ product, quantity: qty }]);
    setIsCheckoutOpen(true);
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

  // Checkout item handlers that support both direct Buy Now and cart checkout
  const activeCheckoutItems = directCheckoutItems.length > 0 ? directCheckoutItems : cart;

  const handleUpdateCheckoutQty = (productId: string, delta: number) => {
    if (directCheckoutItems.length > 0) {
      setDirectCheckoutItems((prev) =>
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
    } else {
      handleUpdateCartQty(productId, delta);
    }
  };

  const handleRemoveCheckoutItem = (productId: string) => {
    if (directCheckoutItems.length > 0) {
      setDirectCheckoutItems((prev) => prev.filter((item) => item.product.id !== productId));
    } else {
      handleRemoveCartItem(productId);
    }
  };

  // Wishlist operations
  const handleToggleWishlist = (productId: string) => {
    setWishlistIds((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const handleMoveWishlistToCart = (product: ProductItem) => {
    handleAddToCart(product, 1);
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
  const wishlistedProducts = allProductsList.filter((p) => wishlistIds[p.id]);

  return (
    <main className="min-h-screen flex flex-col bg-[#FAF7F3]">
      <Header
        wishlistCount={wishlistedProducts.length}
        cartCount={totalCartCount}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onSelectCategory={handleSelectCategory}
        onOpenStoreLocator={() => setIsStoreLocatorOpen(true)}
        onOpenAboutUs={() => setIsAboutUsOpen(true)}
        onOpenContactUs={handleOpenContactUs}
      />

      <HeroSection />
      <FeatureBar />

      <CategoryGrid onSelectCategory={handleSelectCategory} />

      <ShopByCategory
        products={allProductsList}
        services={beautyServicesList}
        activeCategory={activeCategory}
        selectedSubCategory={selectedSubCategory}
        onTabChange={(tab) => {
          setActiveCategory(tab);
          setSelectedSubCategory("All");
        }}
        onSubCategoryChange={(sub) => setSelectedSubCategory(sub)}
        onAddToCart={(product) => handleAddToCart(product, 1)}
        onBuyNow={handleBuyNow}
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
          setDirectCheckoutItems(cart);
          setIsCheckoutOpen(true);
        }}
      />

      {/* WhatsApp Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => {
          setIsCheckoutOpen(false);
          setDirectCheckoutItems([]);
        }}
        items={activeCheckoutItems}
        onUpdateQty={handleUpdateCheckoutQty}
        onRemoveItem={handleRemoveCheckoutItem}
        onBackToCart={() => {
          setIsCheckoutOpen(false);
          setDirectCheckoutItems([]);
          setIsCartOpen(true);
        }}
        onClearCart={() => {
          if (directCheckoutItems.length > 0) {
            setDirectCheckoutItems([]);
          } else {
            setCart([]);
          }
        }}
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

      {/* Instant Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={allProductsList}
        onSelectProduct={(product) => {
          setSearchQuickViewProduct(product);
        }}
      />

      {/* Quick View Triggered from Search */}
      <ProductQuickViewModal
        product={searchQuickViewProduct}
        isOpen={!!searchQuickViewProduct}
        onClose={() => setSearchQuickViewProduct(null)}
        onAddToCart={(p, qty) => handleAddToCart(p, qty)}
        onBuyNow={handleBuyNow}
        isWishlisted={
          searchQuickViewProduct ? !!wishlistIds[searchQuickViewProduct.id] : false
        }
        onToggleWishlist={handleToggleWishlist}
      />
    </main>
  );
}
