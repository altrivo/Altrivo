"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onTopUpSuccess: (amount: number, gateway: string) => void;
}

type Gateway = "JazzCash" | "EasyPaisa" | "Bank Transfer" | "Digital Invoice";
type FlowState = "input" | "processing" | "success" | "invoice";

export function WalletTopUpModal({ isOpen, onClose, onTopUpSuccess }: Props) {
  const [amount, setAmount] = useState<number>(100);
  const [gateway, setGateway] = useState<Gateway>("JazzCash");
  const [flowState, setFlowState] = useState<FlowState>("input");
  const [countdown, setCountdown] = useState(3);
  const [generatedLink, setGeneratedLink] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleStartPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    if (gateway === "Digital Invoice") {
      const mockLink = `https://pay.altrivo.com/invoice/inv-${Math.floor(100000 + Math.random() * 900000)}`;
      setGeneratedLink(mockLink);
      setFlowState("invoice");
      return;
    }

    setFlowState("processing");
    setCountdown(3);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTopUpSuccess(amount, gateway);
          setFlowState("success");
          return 0;
        }
        return prev - 1;
      });
    }, 900);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleReset = () => {
    setFlowState("input");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-overlay backdrop-blur-sm animate-fadeIn">
      <div className="bg-card border border-default max-w-md w-full rounded-3xl p-6 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-default pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary-50 text-primary-700 text-lg font-bold">💳</span>
            <div>
              <h3 className="text-base font-bold text-heading" style={{ fontFamily: "var(--font-display)" }}>
                {flowState === "invoice" ? "Digital Invoice Payment Link" : "Vendor Wallet Top-Up"}
              </h3>
              <p className="text-xs text-subtle">
                {flowState === "invoice" ? "Shareable payment link for custom invoices" : "Instant funds for ads, domain & shipping"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="text-subtle hover:text-heading font-bold text-lg"
          >
            &times;
          </button>
        </div>

        {/* State 1: Input Form */}
        {flowState === "input" && (
          <form onSubmit={handleStartPayment} className="space-y-5">
            {/* Amount Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-heading mb-1.5">
                Top-Up Amount ($ USD)
              </label>

              <div className="grid grid-cols-4 gap-2 mb-2.5">
                {[50, 100, 250, 500].map((preset) => (
                  <button
                    type="button"
                    key={preset}
                    onClick={() => setAmount(preset)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      amount === preset
                        ? "border-primary-500 bg-primary-50 text-primary-900 ring-1 ring-primary-500"
                        : "border-default bg-page hover:border-strong text-body"
                    }`}
                  >
                    ${preset}
                  </button>
                ))}
              </div>

              <input
                type="number"
                min={10}
                max={5000}
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full h-11 px-3.5 rounded-xl border border-default bg-input text-heading text-sm font-bold font-mono focus:outline-none focus:border-primary-500"
              />
            </div>

            {/* Gateway Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-heading mb-1.5">
                Select Payment Gateway
              </label>

              <div className="space-y-2">
                {[
                  { id: "JazzCash", label: "JazzCash Mobile Wallet", icon: "🔴", desc: "Instant mobile wallet debits" },
                  { id: "EasyPaisa", label: "EasyPaisa Account", icon: "🟢", desc: "Instant mobile wallet transfer" },
                  { id: "Bank Transfer", label: "Bank Card / Wire (HBL, Meezan)", icon: "🏦", desc: "Visa, Mastercard & online banking" },
                  { id: "Digital Invoice", label: "Digital Invoice (Payment Link)", icon: "📄", desc: "Generate shareable link for procurement" },
                ].map((item) => (
                  <label
                    key={item.id}
                    onClick={() => setGateway(item.id as Gateway)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      gateway === item.id
                        ? "border-primary-500 bg-primary-50/80 text-primary-950 ring-1 ring-primary-500 font-bold"
                        : "border-default bg-page hover:border-strong text-body"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{item.icon}</span>
                      <div>
                        <p className="font-bold text-heading">{item.label}</p>
                        <p className="text-[11px] text-subtle">{item.desc}</p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="gateway"
                      checked={gateway === item.id}
                      onChange={() => {}}
                      className="accent-primary-500"
                    />
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-primary-500 hover:bg-primary-600 text-on-primary font-bold text-sm shadow-md transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{gateway === "Digital Invoice" ? "Generate Digital Invoice Link" : `Proceed to ${gateway} Gateway ($${amount})`}</span>
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </form>
        )}

        {/* State 2: Simulated Gateway Processing */}
        {flowState === "processing" && (
          <div className="py-8 text-center space-y-4 animate-fadeIn">
            <div className="w-16 h-16 mx-auto border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <div>
              <h4 className="font-bold text-heading text-lg">Connecting to {gateway}...</h4>
              <p className="text-xs text-subtle mt-1">
                Redirecting securely to secure payment terminal ({countdown}s)...
              </p>
            </div>
            <div className="p-3 rounded-xl bg-page border border-default text-xs text-subtle max-w-xs mx-auto">
              Simulating encrypted transaction handshake...
            </div>
          </div>
        )}

        {/* State 3: Success Result */}
        {flowState === "success" && (
          <div className="py-4 text-center space-y-5 animate-fadeIn">
            <div className="w-20 h-20 mx-auto rounded-full bg-success-100 text-success-600 flex items-center justify-center shadow-lg ring-8 ring-success-50">
              <Check size={36} strokeWidth={2.5} />
            </div>

            <div className="space-y-1">
              <h4 className="text-xl font-bold text-heading">Top-Up Successful!</h4>
              <p className="text-xs text-body">
                Added <span className="font-bold text-success-600 font-mono">${amount}.00</span> via <span className="font-semibold text-heading">{gateway}</span> to your vendor wallet.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-page border border-default text-xs space-y-2 text-left">
              <div className="flex justify-between text-subtle">
                <span>Transaction Ref:</span>
                <span className="font-mono font-bold text-heading">TXN-849204</span>
              </div>
              <div className="flex justify-between text-subtle">
                <span>Status:</span>
                <span className="font-bold text-success-600">Settled &bull; Instant Balance Available</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="w-full h-11 rounded-xl bg-primary-500 hover:bg-primary-600 text-on-primary font-bold text-xs shadow-md transition-all"
            >
              Done &amp; Return to Billing
            </button>
          </div>
        )}

        {/* State 4: Digital Invoice Link View */}
        {flowState === "invoice" && (
          <div className="py-2 space-y-5 animate-fadeIn">
            <div className="p-4 rounded-xl bg-primary-50 border border-primary-100 text-xs space-y-2">
              <div className="flex justify-between text-primary-900 font-bold">
                <span>Invoice Total:</span>
                <span className="font-mono text-sm">${amount}.00 USD</span>
              </div>
              <p className="text-primary-700 text-[11px]">
                Payment link generated. Anyone with this link can make payments directly to your vendor wallet.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-heading mb-1">
                Shareable Digital Payment Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={generatedLink}
                  className="w-full h-11 px-3.5 rounded-xl border border-default bg-input text-heading text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-4 h-11 rounded-xl bg-primary-500 text-on-primary text-xs font-bold shrink-0 hover:bg-primary-600 transition-colors"
                >
                  {copiedLink ? (
                    <span className="flex items-center gap-1">
                      <span>Copied!</span>
                      <Check size={14} />
                    </span>
                  ) : (
                    "Copy Link"
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-default">
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2.5 rounded-xl bg-primary-500 text-on-primary text-xs font-bold hover:bg-primary-600"
              >
                Close Modal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
