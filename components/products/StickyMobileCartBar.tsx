"use client";

import { ProductVariant } from "@/types/products";
import { Button } from "@/components/shared";

interface StickyMobileCartBarProps {
  title: string;
  selectedVariant: ProductVariant;
  quantity: number;
  onAddToCart: () => void;
}

export function StickyMobileCartBar({
  title,
  selectedVariant,
  quantity,
  onAddToCart,
}: StickyMobileCartBarProps) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-sticky border-t border-strong bg-card p-3 shadow-modal flex items-center justify-between gap-3 backdrop-blur-md bg-card/95">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-extrabold text-heading truncate">{title}</p>
        <p className="text-sm font-extrabold text-heading font-mono">
          ${(selectedVariant.price * quantity).toFixed(2)}
          <span className="text-[10px] text-body font-normal ml-1">({quantity}x)</span>
        </p>
      </div>

      <Button
        variant="primary"
        size="md"
        onClick={onAddToCart}
        className="font-extrabold shadow-sm shrink-0 px-4 py-2 text-xs"
      >
        🛒 Add to Cart
      </Button>
    </div>
  );
}
