/**
 * Utility functions for currency and price formatting across storefront components.
 */

/**
 * Extracts a numeric value from a price string or number.
 */
export function getNumericPrice(price: string | number | undefined | null): number {
  if (price === undefined || price === null || price === "") return 0;
  if (typeof price === "number") return price;
  const clean = String(price).replace(/[^0-9.]/g, "");
  return parseFloat(clean) || 0;
}

/**
 * Formats any price input into a USD string with $ symbol.
 * Handles inputs like "₨ 20", "Rs 20", "$20", "20", 20.
 */
export function formatPrice(price: string | number | undefined | null): string {
  if (price === undefined || price === null || price === "") return "$0";
  const num = getNumericPrice(price);
  if (num === 0 && !String(price).match(/[1-9]/)) {
    return "$0";
  }
  return `$${num.toLocaleString()}`;
}

/**
 * Formats and returns the cut (original/compare-at) price with $ symbol.
 * If originalPrice is provided, formats it with $.
 * If originalPrice is missing or empty, automatically calculates a realistic cut price
 * based on the current price (e.g. ~35-50% markup) so a cut price is always visible.
 */
export function formatCutPrice(
  price: string | number | undefined | null,
  originalPrice?: string | number | null
): string {
  const numCurrent = getNumericPrice(price);

  if (originalPrice && String(originalPrice).trim() !== "") {
    const numOrig = getNumericPrice(originalPrice);
    if (numOrig > 0) {
      // If original price is greater than current price, show it
      if (numOrig > numCurrent) {
        return `$${numOrig.toLocaleString()}`;
      }
    }
  }

  // If no valid originalPrice exists, compute an attractive strike-through price
  if (numCurrent > 0) {
    let markup = 1.35;
    if (numCurrent <= 20) {
      markup = 1.5; // $20 -> $30, $12 -> $18
    } else if (numCurrent <= 100) {
      markup = 1.4; // $50 -> $70
    } else {
      markup = 1.25;
    }
    const computedCut = Math.ceil(numCurrent * markup);
    return `$${computedCut.toLocaleString()}`;
  }

  return "";
}
