"use client";

export function TrustBadges() {
  const features = [
    {
      title: "Verified Authentic",
      desc: "Includes hand-signed Certificate of Authenticity.",
      icon: "🎨",
    },
    {
      title: "30-Day Money-Back",
      desc: "100% risk-free returns & hassle-free refund.",
      icon: "🛡️",
    },
    {
      title: "Express Shipping",
      desc: "Custom reinforced wood-crate packing.",
      icon: "✈️",
    },
    {
      title: "Direct Support",
      desc: "Artist & vendor studio direct assistance.",
      icon: "💬",
    },
  ];

  return (
    <div className="space-y-4">
      {/* 4 Feature Badges Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {features.map((f, i) => (
          <div
            key={i}
            className="rounded-xl border border-default bg-card p-3.5 text-center space-y-1 shadow-card transition-all hover:border-primary-300"
          >
            <div className="text-2xl">{f.icon}</div>
            <div className="text-xs font-extrabold text-heading">{f.title}</div>
            <div className="text-[11px] font-semibold text-body leading-tight">{f.desc}</div>
          </div>
        ))}
      </div>

      {/* Secured Checkout Badge */}
      <div className="rounded-2xl border border-default bg-card p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-card">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔒</span>
          <div>
            <div className="text-xs font-extrabold text-heading font-display">
              Secured 256-Bit SSL Encrypted Checkout
            </div>
            <div className="text-[11px] font-semibold text-body">
              Protected by A2 Escrow Payment Protection
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono font-bold text-heading">
          <span className="rounded bg-neutral-200 px-2 py-1 border border-neutral-300">VISA</span>
          <span className="rounded bg-neutral-200 px-2 py-1 border border-neutral-300">MC</span>
          <span className="rounded bg-neutral-200 px-2 py-1 border border-neutral-300">STRIPE</span>
          <span className="rounded bg-neutral-200 px-2 py-1 border border-neutral-300">PAYPAL</span>
        </div>
      </div>
    </div>
  );
}
