"use client";

import { Input, Checkbox } from "@/components/shared";
import type { ProductFormData, ProductFormErrors } from "@/types/product-form";

interface TabPricingProps {
  formData: ProductFormData;
  updateField: <K extends keyof ProductFormData>(
    field: K,
    value: ProductFormData[K],
  ) => void;
  profitMetrics: { profit: number; margin: number };
  errors: ProductFormErrors;
}

export function TabPricing({
  formData,
  updateField,
  profitMetrics,
  errors,
}: TabPricingProps) {
  return (
    <div className="space-y-6">
      {/* Price & Compare At Price */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-heading">
            Selling Price ($) <span className="text-error-500">*</span>
          </label>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={formData.price || ""}
            onChange={(e) => updateField("price", parseFloat(e.target.value) || 0)}
            error={errors.price}
          />
          <p className="text-xs text-subtle">
            The final price customers pay at checkout.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-heading">
            Compare-at Price ($)
          </label>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={formData.compareAtPrice || ""}
            onChange={(e) =>
              updateField("compareAtPrice", parseFloat(e.target.value) || 0)
            }
          />
          <p className="text-xs text-subtle">
            To show a strikethrough sale price (e.g. original $99.99).
          </p>
        </div>
      </div>

      {/* Cost Per Item & Profit Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-heading">
            Cost per item ($)
          </label>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={formData.costPerItem || ""}
            onChange={(e) =>
              updateField("costPerItem", parseFloat(e.target.value) || 0)
            }
          />
          <p className="text-xs text-subtle">
            Customers won&apos;t see this. Used for profit analysis.
          </p>
        </div>

        {/* Realtime Profit Card */}
        <div className="p-4 rounded-xl border border-primary-200 bg-primary-50/50 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-primary-800">
            Profitability Analysis
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="block text-xs text-subtle">Profit per unit</span>
              <span
                className={`text-lg font-bold ${
                  profitMetrics.profit >= 0 ? "text-success-600" : "text-error-500"
                }`}
              >
                ${profitMetrics.profit.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="block text-xs text-subtle">Margin</span>
              <span
                className={`text-lg font-bold ${
                  profitMetrics.margin >= 0 ? "text-success-600" : "text-error-500"
                }`}
              >
                {profitMetrics.margin.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-default pt-6 space-y-4">
        <div className="flex items-center gap-3">
          <Checkbox
            id="chargeTax"
            checked={formData.chargeTax}
            onChange={() => updateField("chargeTax", !formData.chargeTax)}
          />
          <label htmlFor="chargeTax" className="text-sm font-medium text-heading cursor-pointer">
            Charge tax on this product
          </label>
        </div>

        {formData.chargeTax && (
          <div className="max-w-xs space-y-1.5 pl-7">
            <label className="block text-xs font-medium text-body">
              Estimated Tax Rate (%)
            </label>
            <Input
              type="number"
              step="0.1"
              min="0"
              placeholder="10.0"
              value={formData.taxRate || ""}
              onChange={(e) =>
                updateField("taxRate", parseFloat(e.target.value) || 0)
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
