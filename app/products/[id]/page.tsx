"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Product, ProductVariant } from "@/types/products";
import { getProductById } from "@/utils/productsMock";
import { useCart } from "@/context/CartContext";
import { ProductGallery } from "@/components/products/ProductGallery";
import { ProductVariantSelector } from "@/components/products/ProductVariantSelector";
import { ProductTabs } from "@/components/products/ProductTabs";
import { TrustBadges } from "@/components/products/TrustBadges";
import { StickyMobileCartBar } from "@/components/products/StickyMobileCartBar";
import { WhatsAppWidget } from "@/components/products/WhatsAppWidget";
import { Card, Button, Badge } from "@/components/shared";
import {
  ShoppingCart,
  CheckCircle2,
  Package,
  ArrowRight,
} from "@/components/shared/LucideIcons";

export default function ProductDetailPage() {
  const resolvedParams = useParams() as { id: string };
  const product: Product = getProductById(resolvedParams.id);
  const { addToCart, openDrawer, totalItemCount } = useCart();

  // Selected variant state
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants[0] || {
      id: "v-default",
      name: "Standard Edition",
      price: product.price,
      originalPrice: product.originalPrice,
      stock: product.stock,
      sku: product.sku,
    }
  );

  // Quantity state
  const [quantity, setQuantity] = useState<number>(1);
  const [cartToast, setCartToast] = useState<string | null>(null);

  const handleAddToCart = () => {
    const mainImage = product.media[0]?.url || selectedVariant.image || "";
    addToCart({
      productId: product.id,
      title: product.title,
      variantName: selectedVariant.name,
      price: selectedVariant.price,
      originalPrice: selectedVariant.originalPrice,
      quantity,
      image: mainImage,
      sku: selectedVariant.sku,
    });

    setCartToast(
      `Added ${quantity}x "${product.title} (${selectedVariant.name})"`
    );
    setTimeout(() => setCartToast(null), 4000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    openDrawer();
  };

  return (
    <div className="min-h-dvh bg-muted font-sans text-body pb-20 md:pb-12">
      {/* Top Store Header Navbar */}
      <header className="h-16 border-b border-default bg-card px-4 sm:px-8 flex items-center justify-between sticky top-0 z-sticky shadow-xs">
        <Link href="/orders" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary-500 flex items-center justify-center text-on-primary font-bold font-display text-lg shadow-sm">
            A
          </div>
          <span className="font-extrabold text-lg text-heading font-display tracking-tight">
            Altrio <span className="text-xs font-bold text-heading uppercase tracking-wider">Art Gallery</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/products">
            <Button variant="ghost" size="sm" className="font-extrabold text-xs gap-1.5">
              <Package size={16} />
              <span>Products Catalog</span>
            </Button>
          </Link>

          <button
            onClick={openDrawer}
            className="p-2 rounded-xl bg-neutral-100 text-heading font-extrabold flex items-center gap-2 border border-default hover:bg-neutral-200 transition-all shadow-xs"
            title="Open Shopping Cart Drawer"
          >
            <ShoppingCart size={18} className="text-primary-600" />
            <span className="text-xs font-mono">Cart</span>
            <span className="h-5 min-w-[20px] rounded-full bg-primary-500 text-on-primary px-1.5 text-[11px] font-mono font-extrabold flex items-center justify-center">
              {totalItemCount}
            </span>
          </button>
        </div>
      </header>

      {/* Main PDP Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Cart Notification Toast */}
        {cartToast && (
          <div className="fixed top-20 right-6 z-toast flex items-center gap-3 rounded-2xl border border-success-300 bg-success-50 px-5 py-3.5 shadow-modal animate-bounce">
            <CheckCircle2 size={20} className="text-success-600 shrink-0" />
            <span className="text-sm font-extrabold text-success-950">{cartToast}</span>
          </div>
        )}

        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-bold text-heading">
          <Link href="/products" className="hover:text-primary-600 hover:underline">
            Catalog
          </Link>
          <span>/</span>
          <span className="text-heading font-bold">{product.category}</span>
          <span>/</span>
          <span className="text-body font-normal truncate max-w-[200px] sm:max-w-none">
            {product.title}
          </span>
        </nav>

        {/* Top Split Layout: Left Gallery (6 Cols), Right Variant & Cart (6 Cols) */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: Image Gallery (6 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <ProductGallery media={product.media} />
          </div>

          {/* Right Column: Info, Variants, Cart & WhatsApp (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Category & Title */}
            <div>
              <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-extrabold text-primary-900 border border-primary-200">
                {product.category}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-heading tracking-tight font-display mt-3">
                {product.title}
              </h1>
              <p className="text-xs font-semibold text-body mt-1">{product.subtitle}</p>

              {/* Rating & Vendor info */}
              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs">
                <div className="flex items-center gap-1 text-warning-600 font-extrabold">
                  <span>{"★".repeat(Math.floor(product.rating))}</span>
                  <span className="text-heading font-mono text-xs">{product.rating}</span>
                  <span className="text-body font-medium">({product.reviewCount} reviews)</span>
                </div>

                <span className="text-default font-bold">|</span>

                <div className="font-bold text-heading">
                  Artist / Vendor: <span className="text-primary-700 font-extrabold">{product.vendorName}</span>
                </div>
              </div>
            </div>

            {/* Dynamic Variant Selector & Price */}
            <ProductVariantSelector
              variants={product.variants}
              selectedVariant={selectedVariant}
              onSelectVariant={(v) => setSelectedVariant(v)}
              quantity={quantity}
              onQuantityChange={(q) => setQuantity(q)}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
            />

            {/* WhatsApp Vendor Widget */}
            <WhatsAppWidget
              vendorName={product.vendorName}
              vendorPhone={product.vendorPhone}
              productTitle={product.title}
              variantName={selectedVariant.name}
              price={selectedVariant.price}
            />
          </div>
        </div>

        {/* Trust Badges & Secured Checkout Banner */}
        <TrustBadges />

        {/* Detailed Tabs: Description, Specs, Shipping, Reviews */}
        <ProductTabs
          description={product.description}
          specs={product.specs}
          reviews={product.reviews}
          shippingInfo={product.shippingInfo}
          returnPolicy={product.returnPolicy}
        />

        {/* Related Products Carousel / Grid */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <div className="space-y-4 pt-4">
            <h2 className="text-xl font-extrabold text-heading font-display">
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {product.relatedProducts.map((rel) => (
                <Card
                  key={rel.id}
                  className="p-4 space-y-3 transition-all duration-normal hover:shadow-card-hover hover:-translate-y-1 group"
                >
                  <div className="aspect-4/3 overflow-hidden rounded-xl bg-neutral-200 relative">
                    <img
                      src={rel.image}
                      alt={rel.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-normal"
                    />
                    <Badge variant="primary" size="sm" className="absolute top-2 left-2 font-extrabold">
                      {rel.category}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-heading text-sm line-clamp-1 group-hover:text-primary-600 transition-colors">
                      {rel.title}
                    </h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-mono font-extrabold text-heading text-base">
                        ${rel.price.toFixed(2)}
                      </span>
                      <span className="text-xs font-bold text-warning-600">
                        ★ {rel.rating}
                      </span>
                    </div>
                  </div>

                  <Link href={`/products/${rel.id}`} className="block">
                    <Button variant="ghost" size="sm" className="w-full font-bold text-xs inline-flex items-center justify-center gap-1">
                      <span>View Product</span>
                      <ArrowRight size={14} />
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Sticky Mobile Add-To-Cart Bar on Scroll */}
        <StickyMobileCartBar
          title={product.title}
          selectedVariant={selectedVariant}
          quantity={quantity}
          onAddToCart={handleAddToCart}
        />
      </main>
    </div>
  );
}
