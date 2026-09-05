"use client";

import React, { useEffect, useRef, useState } from "react";
import { ThemeOption, ThemeProduct } from "@/lib/onboarding";

/**
 * The preview is laid out once at a fixed canvas size and then scaled to fit
 * whatever container it lands in, so the thumbnail in the theme grid and the
 * large modal preview are the same storefront at different sizes.
 */
const DESIGN_W = 680;
const DESIGN_H = 470;

interface Props {
  theme: ThemeOption;
  /** Draws a browser-style chrome bar above the storefront. */
  showChrome?: boolean;
}

function ProductImage({
  product,
  theme,
  height,
  fontSize,
}: {
  product: ThemeProduct;
  theme: ThemeOption;
  height: number;
  fontSize: number;
}) {
  return (
    <div
      style={{
        height,
        borderRadius: theme.tokens.radius,
        background: product.swatch,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize,
        lineHeight: 1,
      }}
    >
      <span>{product.emoji}</span>
    </div>
  );
}

function PriceRow({
  product,
  theme,
  nameSize,
}: {
  product: ThemeProduct;
  theme: ThemeOption;
  nameSize: number;
}) {
  const t = theme.tokens;
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
      <span
        style={{
          fontFamily: t.fontBody,
          fontSize: nameSize,
          color: t.text,
          fontWeight: 500,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {product.name}
      </span>
      <span style={{ fontFamily: t.fontBody, fontSize: nameSize, color: t.primary, fontWeight: 700 }}>
        {product.price}
      </span>
    </div>
  );
}

function ProductArea({ theme }: { theme: ThemeOption }) {
  const t = theme.tokens;
  const card: React.CSSProperties = {
    background: t.surface,
    border: `1px solid ${t.border}`,
    borderRadius: t.radius,
    boxShadow: t.cardShadow,
    padding: 10,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  };

  if (theme.layout === "editorial") {
    const [lead, ...rest] = theme.products;
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: 14 }}>
        <div style={card}>
          <ProductImage product={lead} theme={theme} height={132} fontSize={42} />
          <PriceRow product={lead} theme={theme} nameSize={12} />
        </div>
        <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: 14 }}>
          {rest.slice(0, 2).map((p) => (
            <div key={p.name} style={{ ...card, flexDirection: "row", alignItems: "center", gap: 10 }}>
              <div style={{ width: 56, flexShrink: 0 }}>
                <ProductImage product={p} theme={theme} height={56} fontSize={22} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <PriceRow product={p} theme={theme} nameSize={11} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (theme.layout === "list") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {theme.products.slice(0, 3).map((p) => (
          <div key={p.name} style={{ ...card, flexDirection: "row", alignItems: "center", gap: 12 }}>
            <div style={{ width: 52, flexShrink: 0 }}>
              <ProductImage product={p} theme={theme} height={52} fontSize={22} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <PriceRow product={p} theme={theme} nameSize={12} />
              <div style={{ fontFamily: t.fontBody, fontSize: 10, color: t.muted, marginTop: 3 }}>
                Free shipping · In stock
              </div>
            </div>
            <div
              style={{
                background: t.primary,
                color: t.onPrimary,
                borderRadius: t.buttonRadius,
                fontFamily: t.fontBody,
                fontSize: 10,
                fontWeight: 600,
                padding: "6px 12px",
                flexShrink: 0,
              }}
            >
              Add
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (theme.layout === "masonry") {
    const offsets = [0, 20, 6, 26];
    const heights = [104, 82, 90, 76];
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, alignItems: "start" }}>
        {theme.products.map((p, i) => (
          <div key={p.name} style={{ ...card, marginTop: offsets[i] }}>
            <ProductImage product={p} theme={theme} height={heights[i]} fontSize={26} />
            <PriceRow product={p} theme={theme} nameSize={10} />
          </div>
        ))}
      </div>
    );
  }

  // grid
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
      {theme.products.map((p) => (
        <div key={p.name} style={card}>
          <ProductImage product={p} theme={theme} height={90} fontSize={28} />
          <PriceRow product={p} theme={theme} nameSize={10} />
        </div>
      ))}
    </div>
  );
}

export function ThemePreview({ theme, showChrome = false }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const t = theme.tokens;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = (width: number) => {
      if (width > 0) setScale(width / DESIGN_W);
    };
    measure(el.getBoundingClientRect().width);
    const observer = new ResizeObserver((entries) => measure(entries[0].contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const headingStyle: React.CSSProperties = {
    fontFamily: t.fontHeading,
    fontWeight: t.headingWeight,
    letterSpacing: t.headingTracking,
    textTransform: t.headingTransform,
    color: t.text,
  };

  return (
    <div
      ref={wrapRef}
      style={{
        width: "100%",
        // Reserve the scaled height so the card doesn't jump before measuring.
        height: scale ? DESIGN_H * scale : undefined,
        aspectRatio: scale ? undefined : `${DESIGN_W} / ${DESIGN_H}`,
        overflow: "hidden",
        background: t.bg,
      }}
    >
      <div
        style={{
          width: DESIGN_W,
          height: DESIGN_H,
          transform: `scale(${scale || 1})`,
          transformOrigin: "top left",
          background: t.bg,
          display: "flex",
          flexDirection: "column",
          visibility: scale ? "visible" : "hidden",
        }}
      >
        {showChrome && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 12px",
              background: t.surface,
              borderBottom: `1px solid ${t.border}`,
            }}
          >
            {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
              <span key={c} style={{ width: 9, height: 9, borderRadius: 999, background: c }} />
            ))}
            <div
              style={{
                marginLeft: 8,
                flex: 1,
                height: 18,
                borderRadius: 999,
                background: t.bg,
                border: `1px solid ${t.border}`,
                fontFamily: t.fontBody,
                fontSize: 9,
                color: t.muted,
                display: "flex",
                alignItems: "center",
                paddingLeft: 10,
              }}
            >
              {theme.storeName.toLowerCase().replace(/[^a-z0-9]/g, "")}.altrivo.store
            </div>
          </div>
        )}

        {/* Storefront header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 22px",
            borderBottom: `1px solid ${t.border}`,
            background: t.bg,
          }}
        >
          <span style={{ ...headingStyle, fontSize: 15 }}>{theme.storeName}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {theme.navLinks.map((link) => (
              <span key={link} style={{ fontFamily: t.fontBody, fontSize: 10.5, color: t.muted }}>
                {link}
              </span>
            ))}
            <span
              style={{
                fontFamily: t.fontBody,
                fontSize: 10,
                color: t.onPrimary,
                background: t.primary,
                borderRadius: t.buttonRadius,
                padding: "5px 10px",
                fontWeight: 600,
              }}
            >
              Cart · 2
            </span>
          </div>
        </div>

        {/* Hero */}
        <div
          style={{
            background: t.heroBg,
            padding: "26px 22px",
            display: "flex",
            flexDirection: "column",
            alignItems: theme.layout === "editorial" ? "center" : "flex-start",
            textAlign: theme.layout === "editorial" ? "center" : "left",
            gap: 8,
          }}
        >
          <span
            style={{
              ...headingStyle,
              color: t.heroText,
              fontSize: theme.layout === "masonry" ? 32 : 26,
              lineHeight: 1.12,
            }}
          >
            {theme.heroHeadline}
          </span>
          <span style={{ fontFamily: t.fontBody, fontSize: 11.5, color: t.heroText, opacity: 0.82 }}>
            {theme.heroSub}
          </span>
          <span
            style={{
              marginTop: 6,
              fontFamily: t.fontBody,
              fontSize: 10.5,
              fontWeight: 600,
              color: t.onPrimary,
              background: t.primary,
              border: `1px solid ${t.primary}`,
              borderRadius: t.buttonRadius,
              padding: "8px 16px",
            }}
          >
            {theme.ctaLabel}
          </span>
        </div>

        {/* Product listing */}
        <div style={{ padding: "16px 22px", flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <span style={{ ...headingStyle, fontSize: 13 }}>Featured</span>
            <span style={{ fontFamily: t.fontBody, fontSize: 10, color: t.accent, fontWeight: 600 }}>
              View all →
            </span>
          </div>
          <ProductArea theme={theme} />
        </div>
      </div>
    </div>
  );
}
