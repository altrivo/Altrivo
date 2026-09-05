"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button, Card, Badge } from "@/components/shared";
import {
  CheckCircle2,
  Sparkles,
  Truck,
  Package,
  MessageCircle,
  Share2,
  Copy,
  Facebook,
  UserPlus,
  ShieldCheck,
  ArrowRight,
  ShoppingCart,
} from "@/components/shared/LucideIcons";

export default function CheckoutSuccessPage() {
  const [copied, setCopied] = useState(false);
  const [pixelFired, setPixelFired] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);
  const [password, setPassword] = useState("");

  const mockOrder = {
    id: "ord-1001",
    orderNumber: "#ORD-8942",
    date: "Aug 11, 2026",
    customerEmail: "sophia.m@example.com",
    customerName: "Sophia Martinez",
    customerPhone: "+15552345678",
    carrier: "FedEx Express",
    trackingNumber: "TRK-984712035",
    estimatedDelivery: "Aug 14 - Aug 16, 2026",
    items: [
      {
        id: "item-1",
        title: "Handcrafted Celestial Harmony Canvas Art",
        variant: "24 x 36 Inches / Natural Oak Frame",
        price: 290.0,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=400&q=80",
      },
      {
        id: "item-2",
        title: "Bohemian Hand-Woven Textile Tapestry",
        variant: "20 x 32 Inches / Cream",
        price: 85.0,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1584589167171-541ce45f1eea?auto=format&fit=crop&w=400&q=80",
      },
    ],
    subtotal: 375.0,
    shipping: 0.0,
    tax: 0.0,
    total: 375.0,
  };

  // Fire GA / Meta Pixel Purchase event on mount
  useEffect(() => {
    // 1. Google Analytics 4 Purchase Event
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "purchase", {
        transaction_id: mockOrder.orderNumber,
        value: mockOrder.total,
        currency: "USD",
        items: mockOrder.items.map((item) => ({
          item_id: item.id,
          item_name: item.title,
          price: item.price,
          quantity: item.quantity,
        })),
      });
    }

    // 2. Meta Facebook Pixel Purchase Event
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "Purchase", {
        value: mockOrder.total,
        currency: "USD",
        content_name: "Art & Handcrafted Goods",
      });
    }

    console.log("[Pixel Event Fired]", {
      event: "Purchase",
      orderNumber: mockOrder.orderNumber,
      value: mockOrder.total,
      currency: "USD",
    });

    setPixelFired(true);
  }, []);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }
    setAccountCreated(true);
  };

  const handleWhatsAppTracking = () => {
    const cleanPhone = mockOrder.customerPhone.replace(/[^0-9]/g, "");
    const msg = encodeURIComponent(
      `Hi Tahleel Studio! I just placed order ${mockOrder.orderNumber} ($${mockOrder.total.toFixed(
        2
      )}). Please send me live shipping updates for tracking ${mockOrder.trackingNumber}!`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, "_blank");
  };

  const handleShareWhatsApp = () => {
    const msg = encodeURIComponent(
      `I just ordered handcrafted artwork from Altrio! Check out order ${mockOrder.orderNumber}: ${
        typeof window !== "undefined" ? window.location.href : ""
      }`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(
      typeof window !== "undefined" ? window.location.href : "https://altrio.com"
    );
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
  };

  return (
    <div className="min-h-dvh bg-muted font-sans text-body pb-20">
      {/* Header Navbar */}
      <header className="h-16 border-b border-default bg-card px-4 sm:px-8 flex items-center justify-between sticky top-0 z-sticky shadow-xs">
        <Link href="/orders" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary-500 flex items-center justify-center text-on-primary font-bold font-display text-lg shadow-sm">
            A
          </div>
          <span className="font-extrabold text-lg text-heading font-display tracking-tight">
            Altrio <span className="text-xs font-bold text-heading uppercase tracking-wider">Order Success</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/products">
            <Button variant="ghost" size="sm" className="font-extrabold text-xs gap-1.5">
              <Package size={16} />
              <span>Back to Store</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Pixel Event Fired Banner */}
        {pixelFired && (
          <div className="flex items-center justify-between rounded-2xl border border-success-300 bg-success-50 p-4 shadow-sm text-xs font-extrabold text-success-950 animate-fade-in">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-success-600 shrink-0" />
              <span>GA4 & Meta Pixel Purchase Event Fired successfully!</span>
            </div>
            <span className="font-mono bg-success-200/60 px-2 py-1 rounded text-success-900">
              Value: ${mockOrder.total.toFixed(2)} USD
            </span>
          </div>
        )}

        {/* Hero Success Card */}
        <Card className="p-8 text-center space-y-4 shadow-card border-strong">
          <div className="mx-auto h-20 w-20 rounded-full bg-success-100 text-success-600 flex items-center justify-center border-4 border-success-50 shadow-sm animate-scale-up">
            <CheckCircle2 size={44} />
          </div>

          <div className="space-y-1">
            <Badge variant="success" size="md" className="font-extrabold px-3 py-1">
              PAYMENT VERIFIED & CONFIRMED
            </Badge>
            <h1 className="text-3xl font-extrabold text-heading font-display tracking-tight mt-2">
              Thank You for Your Order!
            </h1>
            <p className="text-sm font-semibold text-body">
              Order <strong className="text-heading font-mono">{mockOrder.orderNumber}</strong> has been received and is now being handcrafted by Tahleel Studio.
            </p>
          </div>

          <div className="rounded-xl bg-neutral-50 p-3 max-w-md mx-auto border border-default text-xs font-semibold text-body">
            📧 A detailed confirmation email was sent to <strong className="text-heading font-bold">{mockOrder.customerEmail}</strong>.
          </div>
        </Card>

        {/* Delivery ETA & WhatsApp Tracking Card */}
        <Card className="p-6 space-y-4 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-default pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center border border-primary-100">
                <Truck size={22} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-heading">Estimated Delivery</h3>
                <p className="text-xs font-bold text-success-700">{mockOrder.estimatedDelivery}</p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-xs font-semibold text-body">Carrier: <strong className="text-heading">{mockOrder.carrier}</strong></p>
              <p className="text-xs font-mono font-bold text-heading">Tracking: {mockOrder.trackingNumber}</p>
            </div>
          </div>

          {/* WhatsApp Direct Tracking Link */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="text-xs font-semibold text-heading">
              Want instant WhatsApp shipping updates from the artist?
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={handleWhatsAppTracking}
              className="w-full sm:w-auto font-extrabold bg-success-600 hover:bg-success-700 text-on-primary border-none shadow-md gap-2"
            >
              <MessageCircle size={18} />
              <span>Track via WhatsApp Live</span>
            </Button>
          </div>
        </Card>

        {/* Itemized Order Summary Card */}
        <Card className="p-6 space-y-6 shadow-card">
          <h2 className="text-lg font-extrabold text-heading font-display border-b border-default pb-3">
            Order Summary ({mockOrder.items.length} Items)
          </h2>

          <div className="divide-y divide-default">
            {mockOrder.items.map((item) => (
              <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-16 w-16 rounded-xl object-cover border border-default shrink-0"
                  />
                  <div>
                    <h3 className="text-sm font-extrabold text-heading">{item.title}</h3>
                    <p className="text-xs font-semibold text-body">{item.variant}</p>
                    <p className="text-xs font-mono font-bold text-body">Qty: {item.quantity}</p>
                  </div>
                </div>
                <div className="text-base font-extrabold text-heading font-mono">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-default space-y-2 text-xs font-semibold">
            <div className="flex justify-between text-body">
              <span>Subtotal</span>
              <span className="font-mono text-heading font-bold">${mockOrder.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-body">
              <span>Shipping</span>
              <span className="font-mono text-success-700 font-extrabold">FREE</span>
            </div>
            <div className="flex justify-between text-heading font-extrabold text-base pt-2 border-t border-default">
              <span>Total Paid</span>
              <span className="font-mono text-xl text-primary-700">${mockOrder.total.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {/* Guest Sign-Up Prompt Card */}
        <Card className="p-6 space-y-4 shadow-card border-primary-200 bg-primary-50/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center border border-primary-200">
              <UserPlus size={22} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-heading font-display">
                Create an Account & Save Your Order
              </h3>
              <p className="text-xs font-semibold text-body">
                Set a password to save {mockOrder.orderNumber} to your account and earn 15% off your next purchase.
              </p>
            </div>
          </div>

          {accountCreated ? (
            <div className="rounded-xl border border-success-200 bg-success-50 p-4 text-xs font-extrabold text-success-900 flex items-center gap-2">
              <CheckCircle2 size={20} className="text-success-600 shrink-0" />
              <span>Account Created! Order {mockOrder.orderNumber} has been linked to {mockOrder.customerEmail}.</span>
            </div>
          ) : (
            <form onSubmit={handleCreateAccount} className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a secure password (min 6 characters)"
                className="w-full sm:flex-1 rounded-xl border border-default bg-card px-3.5 py-2.5 text-xs font-semibold text-heading focus:outline-none shadow-xs"
              />
              <Button variant="primary" size="md" type="submit" className="w-full sm:w-auto font-extrabold shadow-md shrink-0">
                Save Account & Order
              </Button>
            </form>
          )}
        </Card>

        {/* Social Share Buttons Card */}
        <Card className="p-6 space-y-4 text-center shadow-card">
          <h3 className="text-sm font-extrabold text-heading">Share Your Art Purchase with Friends</h3>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShareWhatsApp}
              className="font-extrabold border-success-200 text-success-700 hover:bg-success-50 gap-2"
            >
              <MessageCircle size={16} />
              <span>Share on WhatsApp</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleShareFacebook}
              className="font-extrabold border-primary-200 text-primary-700 hover:bg-primary-50 gap-2"
            >
              <Facebook size={16} />
              <span>Share on Facebook</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyLink}
              className="font-extrabold border-strong text-heading gap-2"
            >
              <Copy size={16} />
              <span>{copied ? "Link Copied!" : "Copy Order Link"}</span>
            </Button>
          </div>
        </Card>

        {/* Bottom Back Button */}
        <div className="text-center pt-4">
          <Link href="/products">
            <Button variant="ghost" size="lg" className="font-extrabold text-heading gap-2">
              <ShoppingCart size={18} />
              <span>Continue Shopping Products Catalog →</span>
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
