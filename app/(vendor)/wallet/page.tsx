"use client";

import { useState } from "react";
import { Button, Card, Badge } from "@/components/shared";
import {
  Wallet,
  CreditCard,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Plus,
  Filter,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  XIcon,
  RefreshCw,
} from "@/components/shared/LucideIcons";

interface Transaction {
  id: string;
  date: string;
  description: string;
  type: "Top-up" | "VCC Funding" | "Subscription" | "Refund";
  amount: number;
  status: "Completed";
}

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-9841",
    date: "Aug 11, 2026 14:22",
    description: "VCC Funding for Meta Ads Sandbox",
    type: "VCC Funding",
    amount: -500.0,
    status: "Completed",
  },
  {
    id: "tx-9840",
    date: "Aug 10, 2026 09:15",
    description: "Bank Transfer Wallet Top-up (Chase ****9842)",
    type: "Top-up",
    amount: 2000.0,
    status: "Completed",
  },
  {
    id: "tx-9839",
    date: "Aug 05, 2026 11:30",
    description: "Altrio Pro Vendor Monthly Subscription",
    type: "Subscription",
    amount: -49.0,
    status: "Completed",
  },
  {
    id: "tx-9838",
    date: "Aug 02, 2026 16:45",
    description: "Escrow Refund Adjustment Order #ORD-8102",
    type: "Refund",
    amount: 145.0,
    status: "Completed",
  },
];

export default function WalletPage() {
  const [walletBalance, setWalletBalance] = useState(4250.0);
  const [vccBalance, setVccBalance] = useState(1500.0);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [typeFilter, setTypeFilter] = useState("all");

  // VCC Masking / Reveal state
  const [isVccRevealed, setIsVccRevealed] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  // Modals state
  const [isGenerateVccOpen, setIsGenerateVccOpen] = useState(false);
  const [vccStep, setVccStep] = useState<"kyc" | "generating" | "success">("kyc");

  const [isTopUpVccOpen, setIsTopUpVccOpen] = useState(false);
  const [topUpAmountInput, setTopUpAmountInput] = useState("300.00");

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Password confirmation to reveal VCC
  const handleConfirmPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput || passwordInput.length < 4) {
      alert("Please enter a valid password.");
      return;
    }
    setIsVccRevealed(true);
    setIsPasswordModalOpen(false);
    setPasswordInput("");
    triggerToast("VCC card details unmasked securely.");
  };

  const handleCopyCard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    triggerToast(`${label} copied to clipboard!`);
  };

  // VCC Generation
  const handleStartGenerateVcc = () => {
    setVccStep("generating");
    setTimeout(() => {
      setVccStep("success");
      triggerToast("New Banking Virtual Credit Card (VCC) generated!");
    }, 2000);
  };

  // VCC Top-up from wallet balance
  const handleVccTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(topUpAmountInput) || 100;
    if (amount > walletBalance) {
      alert("Insufficient wallet balance for this top-up.");
      return;
    }

    setWalletBalance((prev) => prev - amount);
    setVccBalance((prev) => prev + amount);

    const newTx: Transaction = {
      id: `tx-${Math.floor(1000 + Math.random() * 9000)}`,
      date: "Just Now",
      description: "Wallet Transfer to VCC Balance",
      type: "VCC Funding",
      amount: -amount,
      status: "Completed",
    };

    setTransactions((prev) => [newTx, ...prev]);
    setIsTopUpVccOpen(false);
    triggerToast(`$${amount.toFixed(2)} moved from Wallet to VCC Balance in real-time!`);
  };

  // Wallet Top-up from Bank
  const handleWalletTopUpBank = () => {
    const amount = 1000.0;
    setWalletBalance((prev) => prev + amount);
    const newTx: Transaction = {
      id: `tx-${Math.floor(1000 + Math.random() * 9000)}`,
      date: "Just Now",
      description: "Bank Transfer Wallet Top-up (Chase ****9842)",
      type: "Top-up",
      amount: amount,
      status: "Completed",
    };
    setTransactions((prev) => [newTx, ...prev]);
    triggerToast("$1,000.00 added to Wallet Balance via Bank Transfer!");
  };

  const filteredTransactions = transactions.filter((t) => {
    if (typeFilter !== "all" && t.type.toLowerCase().replace(" ", "_") !== typeFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-toast flex items-center gap-3 rounded-2xl border border-success-300 bg-success-50 px-5 py-3.5 shadow-modal animate-bounce">
          <CheckCircle2 size={20} className="text-success-600 shrink-0" />
          <span className="text-sm font-extrabold text-success-950">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-heading font-display">
            Vendor Wallet & Virtual Credit Card (VCC)
          </h1>
          <p className="mt-1 text-sm font-medium text-body">
            Manage main wallet balance, issue virtual ad cards, top up VCC for Meta Ads, and filter transactions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={handleWalletTopUpBank}
            className="font-extrabold shadow-md gap-2"
          >
            <Plus size={18} />
            <span>Top-Up Wallet ($1,000)</span>
          </Button>
        </div>
      </div>

      {/* Top Balances & Masked VCC Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Wallet Balance Card (5 Cols) */}
        <Card className="lg:col-span-5 p-6 space-y-6 shadow-card border-strong bg-card flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase text-body font-display tracking-wider">
                Available Wallet Balance
              </span>
              <Badge variant="success" size="sm" className="font-extrabold">VERIFIED BANK LINKED</Badge>
            </div>

            <h2 className="text-4xl font-extrabold text-heading font-mono tracking-tight">
              ${walletBalance.toFixed(2)}
            </h2>
            <p className="text-xs font-semibold text-body">
              Primary funding account for store subscriptions & VCC allocations.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-default">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsTopUpVccOpen(true)}
              className="font-extrabold shadow-sm gap-1.5"
            >
              <CreditCard size={16} />
              <span>Top-Up VCC Card</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsGenerateVccOpen(true);
                setVccStep("kyc");
              }}
              className="font-extrabold border-strong text-xs gap-1.5"
            >
              <Sparkles size={16} className="text-primary-600" />
              <span>Generate VCC</span>
            </Button>
          </div>
        </Card>

        {/* VCC Virtual Credit Card View (7 Cols) */}
        <Card className="lg:col-span-7 p-6 space-y-5 shadow-card border-primary-300 bg-neutral-900 text-neutral-100 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard size={24} className="text-primary-400" />
              <span className="text-sm font-extrabold tracking-wide uppercase font-display">
                Altrio Banking Virtual Card (VCC)
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-success-400 bg-success-950/80 px-2.5 py-1 rounded-full border border-success-800">
              VCC Balance: ${vccBalance.toFixed(2)}
            </span>
          </div>

          {/* Masked / Unmasked Card Number */}
          <div className="space-y-1 py-3">
            <p className="text-[10px] uppercase tracking-widest text-neutral-400">Card Number</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-mono font-extrabold tracking-widest text-neutral-100">
                {isVccRevealed ? "4289 9841 2049 8912" : "•••• •••• •••• 4289"}
              </span>

              <button
                onClick={() => {
                  if (isVccRevealed) {
                    setIsVccRevealed(false);
                  } else {
                    setIsPasswordModalOpen(true);
                  }
                }}
                className="rounded-xl bg-neutral-800 p-2 text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors border border-neutral-700 flex items-center gap-1.5 text-xs font-bold"
                title="Reveal or Mask VCC Card Number"
              >
                {isVccRevealed ? <EyeOff size={16} /> : <Eye size={16} />}
                <span>{isVccRevealed ? "Mask" : "Reveal"}</span>
              </button>
            </div>
          </div>

          {/* Exp & CVC */}
          <div className="flex items-center justify-between text-xs font-mono text-neutral-300 border-t border-neutral-800 pt-3">
            <div>
              <span className="text-[10px] uppercase text-neutral-400 block font-sans">Expires</span>
              <strong className="text-neutral-100 font-extrabold">09/29</strong>
            </div>

            <div>
              <span className="text-[10px] uppercase text-neutral-400 block font-sans">CVC</span>
              <strong className="text-neutral-100 font-extrabold">{isVccRevealed ? "842" : "***"}</strong>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopyCard("4289984120498912", "Card Number")}
              className="font-bold border-neutral-700 text-neutral-200 hover:bg-neutral-800 text-xs gap-1.5"
            >
              <Copy size={14} />
              <span>Copy Number</span>
            </Button>
          </div>
        </Card>
      </div>

      {/* Transactions Table Section */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-extrabold text-heading font-display">
            Transaction History
          </h2>

          <div className="flex items-center gap-2">
            <Filter size={16} className="text-body shrink-0" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-xl border border-default bg-input px-3.5 py-2 text-xs font-semibold text-heading focus:outline-none shadow-xs"
            >
              <option value="all">All Transaction Types</option>
              <option value="top-up">Top-up</option>
              <option value="vcc_funding">VCC Funding</option>
              <option value="subscription">Subscription</option>
              <option value="refund">Refund</option>
            </select>
          </div>
        </div>

        <Card className="overflow-hidden shadow-card border-default">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold">
              <thead className="bg-neutral-100 uppercase text-[11px] text-heading font-extrabold border-b border-default">
                <tr>
                  <th className="py-3.5 px-4">Transaction ID & Date</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4 text-right">Amount ($)</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-default bg-card text-heading">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="py-4 px-4 font-mono">
                      <p className="font-extrabold text-heading">{tx.id}</p>
                      <p className="text-[11px] font-sans text-body">{tx.date}</p>
                    </td>

                    <td className="py-4 px-4 font-extrabold text-heading">
                      {tx.description}
                    </td>

                    <td className="py-4 px-4">
                      <Badge variant="primary" size="sm" className="font-extrabold">
                        {tx.type}
                      </Badge>
                    </td>

                    <td className="py-4 px-4 text-right font-mono font-extrabold text-sm">
                      <span className={tx.amount > 0 ? "text-success-700" : "text-heading"}>
                        {tx.amount > 0 ? `+$${tx.amount.toFixed(2)}` : `-$${Math.abs(tx.amount).toFixed(2)}`}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <Badge variant="success" size="sm" className="font-extrabold">
                        {tx.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Modal 1: Password Confirmation to Reveal VCC */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-overlay backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl border border-strong bg-card p-6 shadow-modal space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-default pb-3">
              <div className="flex items-center gap-2">
                <Lock size={20} className="text-primary-600" />
                <h3 className="text-base font-extrabold text-heading font-display">
                  Password Confirmation Required
                </h3>
              </div>
              <button onClick={() => setIsPasswordModalOpen(false)} className="rounded-lg p-1.5 text-heading hover:bg-neutral-200">
                <XIcon size={18} />
              </button>
            </div>

            <p className="text-xs font-semibold text-body">
              To unmask your 16-digit VCC card number and CVC code, please confirm your vendor account password.
            </p>

            <form onSubmit={handleConfirmPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase text-heading mb-1">
                  Enter Account Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-default bg-input p-3 text-xs font-semibold text-heading focus:border-focus focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" size="sm" type="button" onClick={() => setIsPasswordModalOpen(false)} className="font-bold border-strong">
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" className="font-bold shadow-md">
                  Unmask Card Details
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Generate VCC Card & Meta Ads Guide */}
      {isGenerateVccOpen && (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-overlay backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl border border-strong bg-card p-6 shadow-modal space-y-5 max-h-[90vh] overflow-y-auto animate-scale-up">
            <div className="flex items-center justify-between border-b border-default pb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={20} className="text-primary-600" />
                <h3 className="text-base font-extrabold text-heading font-display">
                  Generate Banking Virtual Credit Card (VCC)
                </h3>
              </div>
              <button onClick={() => setIsGenerateVccOpen(false)} className="rounded-lg p-1.5 text-heading hover:bg-neutral-200">
                <XIcon size={18} />
              </button>
            </div>

            {/* Step: KYC Confirmation */}
            {vccStep === "kyc" && (
              <div className="space-y-4 text-xs font-semibold">
                <div className="rounded-xl border border-success-200 bg-success-50 p-4 space-y-1">
                  <p className="font-extrabold text-success-900 flex items-center gap-2">
                    <ShieldCheck size={18} className="text-success-600" />
                    <span>Vendor KYC Verification Status: APPROVED</span>
                  </p>
                  <p className="text-success-800 text-[11px]">
                    Identity verified for Tahleel Studio (SSN/EIN ending in ****4291).
                  </p>
                </div>

                <p className="text-body">
                  Clicking below will request our Banking API to issue a dedicated 16-digit Virtual Credit Card (VCC) for funding your Meta Ad Manager campaigns.
                </p>

                <Button
                  variant="primary"
                  size="md"
                  onClick={handleStartGenerateVcc}
                  className="w-full font-extrabold shadow-md gap-2 py-2.5"
                >
                  <span>Issue Virtual Credit Card (VCC)</span>
                </Button>
              </div>
            )}

            {/* Step: Progress Spinner */}
            {vccStep === "generating" && (
              <div className="py-12 text-center space-y-4">
                <RefreshCw size={36} className="mx-auto text-primary-500 animate-spin" />
                <p className="text-sm font-extrabold text-heading">Issuing Virtual Credit Card via Banking API...</p>
                <p className="text-xs text-body">Generating 16-digit PAN, EXP, and CVC codes.</p>
              </div>
            )}

            {/* Step: Success + Meta Ads Setup Guide */}
            {vccStep === "success" && (
              <div className="space-y-4 text-xs font-semibold">
                <div className="rounded-xl border border-success-200 bg-success-50 p-4 space-y-2">
                  <p className="font-extrabold text-success-900 flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-success-600 shrink-0" />
                    <span>VCC Successfully Issued!</span>
                  </p>
                  <p className="text-success-800 font-mono text-xs">
                    Card Number: <strong>4289 9841 2049 8912</strong> (EXP: 09/29 | CVC: 842)
                  </p>
                </div>

                {/* Guide: How to Add VCC to Meta Ads */}
                <div className="space-y-2 pt-2 border-t border-default">
                  <h4 className="font-extrabold text-heading text-sm font-display">
                    📖 How to add your VCC to Meta Ads Manager:
                  </h4>
                  <ol className="space-y-2 list-decimal list-inside text-body text-[11px] leading-relaxed">
                    <li>Open <strong>Meta Ads Manager Billing Settings</strong> in your browser.</li>
                    <li>Click <strong>Add Payment Method</strong> and choose <strong>Credit/Debit Card</strong>.</li>
                    <li>Copy your VCC card number (<code>4289 9841 2049 8912</code>) and CVC (<code>842</code>).</li>
                    <li>Save card and set as default payment method for Meta Sandbox API ads.</li>
                  </ol>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setIsGenerateVccOpen(false)}
                  className="w-full font-extrabold shadow-md"
                >
                  Done & Close
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal 3: VCC Top-up Flow */}
      {isTopUpVccOpen && (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-overlay backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl border border-strong bg-card p-6 shadow-modal space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-default pb-3">
              <div className="flex items-center gap-2">
                <CreditCard size={20} className="text-primary-600" />
                <h3 className="text-base font-extrabold text-heading font-display">
                  Top-Up VCC Card Balance
                </h3>
              </div>
              <button onClick={() => setIsTopUpVccOpen(false)} className="rounded-lg p-1.5 text-heading hover:bg-neutral-200">
                <XIcon size={18} />
              </button>
            </div>

            <form onSubmit={handleVccTopUpSubmit} className="space-y-4 text-xs font-semibold">
              <div className="rounded-xl bg-neutral-100 p-3 border border-default space-y-1">
                <div className="flex justify-between text-body">
                  <span>Available Wallet Balance:</span>
                  <strong className="font-mono text-heading">${walletBalance.toFixed(2)}</strong>
                </div>
                <div className="flex justify-between text-body">
                  <span>Current VCC Balance:</span>
                  <strong className="font-mono text-heading">${vccBalance.toFixed(2)}</strong>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-heading mb-1">
                  Transfer Amount ($)
                </label>
                <input
                  type="number"
                  step="10"
                  required
                  value={topUpAmountInput}
                  onChange={(e) => setTopUpAmountInput(e.target.value)}
                  className="w-full rounded-xl border border-default bg-input p-3 font-mono font-extrabold text-heading text-lg focus:border-focus focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" size="sm" type="button" onClick={() => setIsTopUpVccOpen(false)} className="font-bold border-strong">
                  Cancel
                </Button>
                <Button variant="primary" size="md" type="submit" className="font-extrabold shadow-md">
                  Confirm Transfer to VCC
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
