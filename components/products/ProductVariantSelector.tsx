"use client";

import { ProductVariant } from "@/types/products";
import { Badge, Button } from "@/components/shared";
import { ShoppingCart, Sparkles, Plus, Minus } from "@/components/shared/LucideIcons";

interface ProductVariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant;
  onSelectVariant: (variant: ProductVariant) => void;
  quantity: number;
  onQuantityChange: (qty: number) => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
}

export function ProductVariantSelector({
  variants,
  selectedVariant,
  onSelectVariant,
  quantity,
  onQuantityChange,
  onAddToCart,
  onBuyNow,
}: ProductVariantSelectorProps) {
  const sizes = Array.from(new Set(variants.map((v) => v.size).filter(Boolean)));
  const colors = Array.from(new Set(variants.map((v) => v.color).filter(Boolean)));

  const handleSizeClick = (size?: string) => {
    const match = variants.find(
      (v) => v.size === size && (selectedVariant.color ? v.color === selectedVariant.color : true)
    );
    if (match) onSelectVariant(match);
  };

  const handleColorClick = (color?: string) => {
    const match = variants.find(
      (v) => v.color === color && (selectedVariant.size ? v.size === selectedVariant.size : true)
    );
    if (match) onSelectVariant(match);
  };

  const discountPct = selectedVariant.originalPrice
    ? Math.round(
        ((selectedVariant.originalPrice - selectedVariant.price) / selectedVariant.originalPrice) * 100
      )
    : 0;

  return (
    <div className="space-y-6">
      {/* Price & Discount Header */}
      <div className="rounded-2xl border border-default bg-card p-5 shadow-card space-y-2">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-extrabold text-heading font-mono">
            ${selectedVariant.price.toFixed(2)}
          </span>
          {selectedVariant.originalPrice && (
            <span className="text-base text-body font-bold line-through font-mono">
              ${selectedVariant.originalPrice.toFixed(2)}
            </span>
          )}
          {discountPct > 0 && (
            <Badge variant="error" size="sm" className="font-extrabold px-2.5 py-0.5">
              SAVE {discountPct}% OFF
            </Badge>
          )}
        </div>

        {/* Stock Status Indicator */}
        <div className="flex items-center gap-3 pt-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-success-700 bg-success-50 border border-success-200 px-3 py-1 rounded-full">
            <span className="h-2 w-2 rounded-full bg-success-500 animate-pulse" />
            <span>
              {selectedVariant.stock > 0
                ? `In Stock (${selectedVariant.stock} items ready to ship)`
                : "Out of Stock"}
            </span>
          </div>

          <span className="text-xs font-mono font-bold text-body">
            SKU: <strong className="text-heading font-extrabold">{selectedVariant.sku}</strong>
          </span>
        </div>
      </div>

      {/* Variant Selector: Size Options */}
      {sizes.length > 0 && (
        <div className="space-y-2">
          <label className="block text-xs font-extrabold uppercase tracking-wider text-heading font-display">
            Select Canvas Size:
          </label>
          <div className="flex flex-wrap gap-2.5">
            {sizes.map((sz) => {
              const isSelected = selectedVariant.size === sz;
              return (
                <button
                  key={sz}
                  onClick={() => handleSizeClick(sz)}
                  className={`rounded-xl px-4 py-2 text-xs font-extrabold transition-all border-2 ${
                    isSelected
                      ? "border-primary-500 bg-primary-50 text-primary-900 shadow-xs scale-102"
                      : "border-default bg-card text-heading hover:border-strong hover:bg-neutral-100"
                  }`}
                >
                  {sz}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Variant Selector: Color / Finish Options */}
      {colors.length > 0 && (
        <div className="space-y-2">
          <label className="block text-xs font-extrabold uppercase tracking-wider text-heading font-display">
            Select Frame Finish:
          </label>
          <div className="flex flex-wrap gap-2.5">
            {colors.map((clr) => {
              const isSelected = selectedVariant.color === clr;
              return (
                <button
                  key={clr}
                  onClick={() => handleColorClick(clr)}
                  className={`rounded-xl px-4 py-2 text-xs font-extrabold transition-all border-2 ${
                    isSelected
                      ? "border-primary-500 bg-primary-50 text-primary-900 shadow-xs scale-102"
                      : "border-default bg-card text-heading hover:border-strong hover:bg-neutral-100"
                  }`}
                >
                  {clr}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity Stepper & Add To Cart Actions */}
      <div className="space-y-3 pt-2">
        <label className="block text-xs font-extrabold uppercase tracking-wider text-heading font-display">
          Quantity:
        </label>
        <div className="flex flex-wrap items-center gap-3">
          {/* Quantity Stepper */}
          <div className="flex items-center rounded-xl border border-strong bg-card overflow-hidden shadow-xs">
            <button
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="px-3.5 py-2.5 text-heading hover:bg-neutral-200 transition-colors disabled:opacity-40"
            >
              <Minus size={14} />
            </button>
            <span className="w-12 text-center text-sm font-extrabold text-heading font-mono">
              {quantity}
            </span>
            <button
              onClick={() => onQuantityChange(Math.min(selectedVariant.stock, quantity + 1))}
              disabled={quantity >= selectedVariant.stock}
              className="px-3.5 py-2.5 text-heading hover:bg-neutral-200 transition-colors disabled:opacity-40"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Add To Cart Primary Button */}
          <Button
            variant="primary"
            size="lg"
            onClick={onAddToCart}
            className="flex-1 font-extrabold shadow-md hover:shadow-lg gap-2 text-base"
          >
            <ShoppingCart size={20} />
            <span>Add to Cart — ${(selectedVariant.price * quantity).toFixed(2)}</span>
          </Button>
        </div>

        {/* Buy Now Direct Button */}
        <Button
          variant="accent"
          size="lg"
          onClick={onBuyNow}
          className="w-full font-extrabold text-base shadow-sm hover:shadow-md gap-2"
        >
          <Sparkles size={18} />
          <span>Buy Now (Instant Checkout)</span>
        </Button>
      </div>
    </div>
  );
}
