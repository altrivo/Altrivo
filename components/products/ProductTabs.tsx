"use client";

import { useState } from "react";
import { ProductSpec, ProductReview } from "@/types/products";
import { Button, Card } from "@/components/shared";

interface ProductTabsProps {
  description: string;
  specs: ProductSpec[];
  reviews: ProductReview[];
  shippingInfo: string;
  returnPolicy: string;
}

export function ProductTabs({
  description,
  specs,
  reviews,
  shippingInfo,
  returnPolicy,
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<"desc" | "specs" | "shipping" | "reviews">("desc");

  const tabs = [
    { id: "desc", label: "Description" },
    { id: "specs", label: "Specifications & Details" },
    { id: "shipping", label: "Shipping & Returns" },
    { id: "reviews", label: `Reviews (${reviews.length})` },
  ];

  return (
    <Card className="p-6 space-y-6">
      {/* Tab Navigation */}
      <div className="flex border-b border-default overflow-x-auto gap-2 pb-px">
        {tabs.map((t) => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-3 text-sm font-extrabold transition-all border-b-2 whitespace-nowrap ${
                isActive
                  ? "border-primary-500 text-primary-700 bg-primary-50/60 rounded-t-xl"
                  : "border-transparent text-heading hover:text-primary-600 hover:border-default"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="pt-2 text-sm text-heading leading-relaxed">
        {/* 1. Description Tab */}
        {activeTab === "desc" && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-base font-extrabold text-heading">Artwork & Craft Overview</h3>
            <p className="whitespace-pre-line font-medium text-body leading-relaxed">{description}</p>
          </div>
        )}

        {/* 2. Specifications Tab */}
        {activeTab === "specs" && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-base font-extrabold text-heading">Product Specifications</h3>
            <div className="rounded-xl border border-default overflow-hidden">
              <table className="w-full text-left text-xs">
                <tbody className="divide-y divide-default bg-card">
                  {specs.map((spec, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-neutral-50" : "bg-card"}>
                      <td className="py-3 px-4 font-extrabold text-heading w-1/3 border-r border-default uppercase text-[11px]">
                        {spec.label}
                      </td>
                      <td className="py-3 px-4 font-semibold text-body">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. Shipping & Returns Tab */}
        {activeTab === "shipping" && (
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-xl border border-default p-4 bg-neutral-50 space-y-2">
              <h4 className="font-extrabold text-heading text-sm flex items-center gap-2">
                <span>🚚 Shipping & Logistics Policy</span>
              </h4>
              <p className="text-xs font-semibold text-body">{shippingInfo}</p>
            </div>

            <div className="rounded-xl border border-default p-4 bg-neutral-50 space-y-2">
              <h4 className="font-extrabold text-heading text-sm flex items-center gap-2">
                <span>🔄 30-Day Money-Back Returns</span>
              </h4>
              <p className="text-xs font-semibold text-body">{returnPolicy}</p>
            </div>
          </div>
        )}

        {/* 4. Customer Reviews Tab */}
        {activeTab === "reviews" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-default pb-4">
              <div>
                <h3 className="text-2xl font-extrabold text-heading font-mono">4.9 ★★★★★</h3>
                <p className="text-xs font-bold text-body">Based on {reviews.length} verified customer reviews</p>
              </div>

              <Button variant="ghost" size="sm" className="font-bold border-strong">
                ✍️ Write a Review
              </Button>
            </div>

            {/* Review Cards List */}
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="rounded-xl border border-default p-4 bg-neutral-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-heading text-sm">{rev.author}</span>
                      {rev.verifiedPurchase && (
                        <span className="rounded-full bg-success-50 text-success-700 px-2 py-0.5 text-[10px] font-extrabold border border-success-200">
                          VERIFIED BUYER
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-body">{rev.date}</span>
                  </div>

                  <div className="text-xs text-warning-600 font-extrabold">
                    {"★".repeat(rev.rating)}
                  </div>

                  <p className="text-xs font-semibold text-heading italic">&ldquo;{rev.comment}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
