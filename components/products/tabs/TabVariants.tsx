"use client";

import { useState, type KeyboardEvent } from "react";

import { Button, Input, Checkbox } from "@/components/shared";
import { Plus, X } from "lucide-react";
import type {
  ProductFormData,
  VariantOption,
  ProductVariant,
} from "@/types/product-form";

interface TabVariantsProps {
  formData: ProductFormData;
  updateField: <K extends keyof ProductFormData>(
    field: K,
    value: ProductFormData[K],
  ) => void;
  addOption: () => void;
  removeOption: (id: string) => void;
  updateOption: (id: string, name: string, values: string[]) => void;
  updateVariantRow: (
    variantId: string,
    field: keyof ProductVariant,
    value: any,
  ) => void;
  bulkSetVariantPrices?: (price: number) => void;
  bulkSetVariantStocks?: (stock: number) => void;
  bulkSetVariantStatus?: (enabled: boolean) => void;
}

export function TabVariants({
  formData,
  updateField,
  addOption,
  removeOption,
  updateOption,
  updateVariantRow,
  bulkSetVariantPrices,
  bulkSetVariantStocks,
  bulkSetVariantStatus,
}: TabVariantsProps) {
  const [bulkPriceInput, setBulkPriceInput] = useState<string>("");
  const [bulkStockInput, setBulkStockInput] = useState<string>("");

  const handleApplyBulkPrice = () => {
    const val = parseFloat(bulkPriceInput);
    if (!isNaN(val) && val >= 0 && bulkSetVariantPrices) {
      bulkSetVariantPrices(val);
      setBulkPriceInput("");
    }
  };

  const handleApplyBulkStock = () => {
    const val = parseInt(bulkStockInput, 10);
    if (!isNaN(val) && val >= 0 && bulkSetVariantStocks) {
      bulkSetVariantStocks(val);
      setBulkStockInput("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Enable Variants Checkbox */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-default bg-muted/30">
        <div>
          <h4 className="text-sm font-semibold text-heading">
            Product Has Multiple Variants
          </h4>
          <p className="text-xs text-subtle mt-0.5">
            Add options like Size, Color, or Material to generate all variant combinations automatically.
          </p>
        </div>
        <Checkbox
          checked={formData.hasVariants}
          onChange={() => {
            const nextHas = !formData.hasVariants;
            updateField("hasVariants", nextHas);
            if (nextHas && formData.options.length === 0) {
              addOption();
            }
          }}
        />
      </div>

      {formData.hasVariants && (
        <>
          {/* 1. Options Builder (Up to 3 Option Types) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-heading">
                1. Define Variant Options (Up to 3 Types)
              </h4>
              <span className="text-xs text-subtle">
                {formData.options.length}/3 option types defined
              </span>
            </div>

            {formData.options.map((option, idx) => (
              <OptionRow
                key={option.id}
                option={option}
                index={idx}
                onRemove={() => removeOption(option.id)}
                onChange={(name, values) =>
                  updateOption(option.id, name, values)
                }
              />
            ))}

            {formData.options.length < 3 && (
              <Button variant="ghost" size="sm" onClick={addOption} className="gap-1.5">
                <Plus size={14} />
                <span>Add Option Type (e.g. Size, Color, Material)</span>
              </Button>
            )}
          </div>

          {/* 2. Generated Variants Matrix & Bulk-Set Toolbar */}
          {formData.variants.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-default">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-heading">
                    2. Generated Variants Matrix ({formData.variants.length} combinations)
                  </h4>
                  <p className="text-xs text-subtle">
                    Toggle enabled status, pick variant images, or bulk-set price & stock across all variants.
                  </p>
                </div>

                {/* Bulk Enable / Disable All */}
                {bulkSetVariantStatus && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => bulkSetVariantStatus(true)}
                    >
                      Enable All
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => bulkSetVariantStatus(false)}
                    >
                      Disable All
                    </Button>
                  </div>
                )}
              </div>

              {/* Bulk-Set Toolbar Card */}
              <div className="p-4 rounded-xl border border-primary-200 bg-primary-50/40 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Bulk Price */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 space-y-1">
                    <label className="block text-xs font-semibold text-primary-800">
                      Bulk-Set Price ($)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 49.99"
                      value={bulkPriceInput}
                      onChange={(e) => setBulkPriceInput(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleApplyBulkPrice}
                    disabled={!bulkPriceInput}
                    className="mt-5"
                  >
                    Apply Price
                  </Button>
                </div>

                {/* Bulk Stock */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 space-y-1">
                    <label className="block text-xs font-semibold text-primary-800">
                      Bulk-Set Stock
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g. 50"
                      value={bulkStockInput}
                      onChange={(e) => setBulkStockInput(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleApplyBulkStock}
                    disabled={!bulkStockInput}
                    className="mt-5"
                  >
                    Apply Stock
                  </Button>
                </div>
              </div>

              {/* Variants Matrix Table */}
              <div className="overflow-x-auto border border-default rounded-xl bg-card shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-default bg-muted/50">
                      <th className="w-16 px-4 py-3 text-center font-medium text-subtle text-xs">
                        Enable
                      </th>
                      <th className="w-16 px-2 py-3 text-center font-medium text-subtle text-xs">
                        Image
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-subtle text-xs">
                        Variant Option Combination
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-subtle text-xs">
                        SKU
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-subtle text-xs">
                        Price ($)
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-subtle text-xs">
                        Stock Quantity
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-default">
                    {formData.variants.map((v) => {
                      const label = Object.entries(v.optionValues)
                        .map(([k, val]) => `${k}: ${val}`)
                        .join(" / ");

                      const isEnabled = v.enabled !== false;

                      return (
                        <tr
                          key={v.id}
                          className={`transition-colors ${
                            isEnabled ? "hover:bg-muted/30" : "bg-muted/40 opacity-70"
                          }`}
                        >
                          {/* Enable/Disable Toggle */}
                          <td className="px-4 py-3 text-center">
                            <Checkbox
                              checked={isEnabled}
                              onChange={() =>
                                updateVariantRow(v.id, "enabled", !isEnabled)
                              }
                              aria-label={`Enable ${label}`}
                            />
                          </td>

                          {/* Variant Image */}
                          <td className="px-2 py-3 text-center">
                            <div className="h-8 w-8 rounded-lg border border-default bg-muted overflow-hidden mx-auto flex items-center justify-center">
                              {v.image ? (
                                <img
                                  src={v.image}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : formData.images[0] ? (
                                <img
                                  src={formData.images[0].url}
                                  alt=""
                                  className="h-full w-full object-cover opacity-60"
                                />
                              ) : (
                                <span className="text-[10px] text-subtle">No img</span>
                              )}
                            </div>
                          </td>

                          {/* Combination Label */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-heading">
                                {label || "Default Variant"}
                              </span>
                              {!isEnabled && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-neutral-200 text-neutral-700">
                                  Disabled on Store
                                </span>
                              )}
                            </div>
                          </td>

                          {/* SKU */}
                          <td className="px-4 py-3">
                            <Input
                              value={v.sku}
                              onChange={(e) =>
                                updateVariantRow(v.id, "sku", e.target.value)
                              }
                              className="h-8 text-xs font-mono"
                              disabled={!isEnabled}
                            />
                          </td>

                          {/* Price */}
                          <td className="px-4 py-3 text-right">
                            <Input
                              type="number"
                              step="0.01"
                              value={v.price || ""}
                              onChange={(e) =>
                                updateVariantRow(
                                  v.id,
                                  "price",
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                              className="h-8 text-xs text-right w-24 ml-auto"
                              disabled={!isEnabled}
                            />
                          </td>

                          {/* Stock */}
                          <td className="px-4 py-3 text-right">
                            <Input
                              type="number"
                              value={v.stock}
                              onChange={(e) =>
                                updateVariantRow(
                                  v.id,
                                  "stock",
                                  parseInt(e.target.value, 10) || 0,
                                )
                              }
                              className="h-8 text-xs text-right w-20 ml-auto"
                              disabled={!isEnabled}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function OptionRow({
  option,
  index,
  onRemove,
  onChange,
}: {
  option: VariantOption;
  index: number;
  onRemove: () => void;
  onChange: (name: string, values: string[]) => void;
}) {
  const [valInput, setValInput] = useState("");

  const handleAddVal = () => {
    const trimmed = valInput.trim();
    if (trimmed && !option.values.includes(trimmed)) {
      onChange(option.name, [...option.values, trimmed]);
      setValInput("");
    }
  };

  const handleKeyDownVal = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddVal();
    }
  };

  const handleRemoveVal = (valToRemove: string) => {
    onChange(
      option.name,
      option.values.filter((v) => v !== valToRemove),
    );
  };

  return (
    <div className="p-4 rounded-xl border border-default bg-card space-y-3 shadow-xs">
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-semibold text-subtle uppercase">
          Option Type #{index + 1}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="text-xs text-error-500 hover:text-error-700 font-medium transition-colors"
        >
          Remove Option
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="block text-xs font-medium text-body">Option Name</label>
          <Input
            placeholder="e.g. Size, Color, or Material"
            value={option.name}
            onChange={(e) => onChange(e.target.value, option.values)}
          />
        </div>

        <div className="md:col-span-2 space-y-1">
          <label className="block text-xs font-medium text-body">
            Option Values (press Enter)
          </label>
          <div className="flex flex-wrap items-center gap-1.5 p-2 border border-default rounded-xl min-h-[40px] bg-background">
            {option.values.map((v) => (
              <span
                key={v}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted text-heading text-xs font-medium border border-default"
              >
                {v}
                <button
                  type="button"
                  onClick={() => handleRemoveVal(v)}
                  className="hover:text-error-600 ml-0.5 p-0.5"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            <input
              type="text"
              placeholder={
                option.values.length === 0
                  ? "e.g. Small, Medium, Large..."
                  : "Add value..."
              }
              value={valInput}
              onChange={(e) => setValInput(e.target.value)}
              onKeyDown={handleKeyDownVal}
              onBlur={handleAddVal}
              className="flex-1 min-w-[120px] bg-transparent text-xs text-heading placeholder:text-subtle focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
