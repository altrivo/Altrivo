"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useCart } from "@/context/CartContext";
import { AccountHeader } from "@/components/account/AccountHeader";
import { AccountNav } from "@/components/account/AccountNav";
import { SAMPLE_PRODUCTS } from "@/utils/productsMock";
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";

export default function CustomerWishlistPage() {
  const router = useRouter();
  const { customer, loading } = useCustomerAuth();
  const { addToCart } = useCart();

  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !customer) {
      router.push("/login?redirect=/account/wishlist");
      return;
    }

    if (customer) {
      setFetching(true);
      fetch(`/api/customer/wishlist?customerId=${customer.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.items) {
            // Match with sample products
            const enriched = data.items.map((item: any) => {
              const prod = SAMPLE_PRODUCTS.find((p) => p.id === item.product_id);
              return {
                id: item.id,
                productId: item.product_id,
                title: prod?.title || "Handcrafted Wall Art",
                price: prod?.price || 290.0,
                image: prod?.media?.[0]?.url || "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=400&q=80",
                category: prod?.category || "Art",
              };
            });
            setWishlistItems(enriched);
          } else {
            // Default sample item if empty to preview functionality
            setWishlistItems([
              {
                id: "w-demo-1",
                productId: "p-101",
                title: "Handcrafted Celestial Harmony Canvas Art",
                price: 290.0,
                image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=400&q=80",
                category: "Wall Art & Canvas",
              },
            ]);
          }
        })
        .catch(() => {})
        .finally(() => setFetching(false));
    }
  }, [customer, loading, router]);

  const handleRemove = async (productId: string) => {
    setWishlistItems((prev) => prev.filter((it) => it.productId !== productId));
    if (customer) {
      try {
        await fetch(`/api/customer/wishlist?customerId=${customer.id}&productId=${productId}`, {
          method: "DELETE",
        });
      } catch (e) {}
    }
  };

  const handleAddToCart = (item: any) => {
    addToCart({
      productId: item.productId,
      title: item.title,
      variantName: "Standard",
      price: item.price,
      quantity: 1,
      image: item.image,
      sku: `SKU-${item.productId.toUpperCase()}`,
    });
  };

  if (loading || !customer) {
    return (
      <div className="min-h-screen bg-white">
        <AccountHeader />
        <div className="max-w-6xl mx-auto px-4 py-12 text-center text-xs text-[#5c3d5c]">
          Loading wishlist...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <AccountHeader />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <AccountNav />
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl border border-[#5c3d5c]/20 p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-black">My Saved Wishlist</h1>
                  <p className="text-xs text-[#5c3d5c] mt-0.5">
                    Save your favorite products to buy later or monitor for discounts.
                  </p>
                </div>
                <span className="text-xs font-bold text-[#3e2845] bg-[#3e2845]/10 px-3 py-1 rounded-full">
                  {wishlistItems.length} items
                </span>
              </div>

              {fetching ? (
                <div className="py-12 text-center text-xs text-[#5c3d5c]">Loading wishlist...</div>
              ) : wishlistItems.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-[#5c3d5c]/20 rounded-xl space-y-3">
                  <Heart className="w-10 h-10 text-[#5c3d5c]/40 mx-auto" />
                  <p className="text-xs font-semibold text-black">Your wishlist is currently empty.</p>
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3e2845] text-white text-xs font-bold shadow-xs hover:bg-[#4b3254]"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Explore Store</span>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlistItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-[#5c3d5c]/20 hover:border-[#3e2845]/40 transition-colors flex gap-4 bg-white"
                    >
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-[#5c3d5c] uppercase">
                            {item.category}
                          </span>
                          <h3 className="text-xs font-bold text-black truncate mt-0.5">
                            {item.title}
                          </h3>
                          <p className="text-xs font-bold text-[#3e2845] mt-1">
                            ₨ {Number(item.price).toLocaleString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <button
                            onClick={() => handleAddToCart(item)}
                            className="flex-1 py-1.5 px-3 rounded-lg bg-[#3e2845] hover:bg-[#4b3254] text-white text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Add to Cart</span>
                          </button>

                          <button
                            onClick={() => handleRemove(item.productId)}
                            className="p-1.5 rounded-lg border border-[#5c3d5c]/20 text-gray-400 hover:text-red-600 hover:border-red-200 transition-colors cursor-pointer"
                            title="Remove from wishlist"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
