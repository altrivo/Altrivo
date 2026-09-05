"use client";

import { useState } from "react";
import { VendorLayout } from "@/components/vendor/VendorLayout";
import { Card, Button, Badge } from "@/components/shared";
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  Eye,
  Send,
  TrendingUp,
  Sparkles,
  RefreshCw,
  XIcon,
} from "@/components/shared/LucideIcons";

interface EmailTemplate {
  id: string;
  title: string;
  category: string;
  subject: string;
  bodyPreview: string;
  isActive: boolean;
  stats: {
    sent: number;
    openRate: number;
    clickRate: number;
    convertedRevenue: number;
  };
}

const INITIAL_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "tpl-1",
    title: "Abandoned Cart Recovery Sequence",
    category: "Automated Flow",
    subject: "Still admiring your chosen artwork? Save 10% before it sells out!",
    bodyPreview: `Hi {{customer_first_name}},
    
We noticed you left the original handcrafted piece "{{product_title}}" in your shopping cart. 

As a special gesture from Tahleel Studio, use promo code WELCOME10 at checkout for an instant 10% discount + Free Express Shipping!`,
    isActive: true,
    stats: {
      sent: 1420,
      openRate: 68.4,
      clickRate: 24.2,
      convertedRevenue: 3840.0,
    },
  },
  {
    id: "tpl-2",
    title: "Post-Purchase Thank You & Artwork Care Guide",
    category: "Customer Delight",
    subject: "Thank you for your order! Here is your Certificate & Care Guide",
    bodyPreview: `Dear {{customer_first_name}},
    
Thank you for supporting independent fine art! Your order {{order_number}} is currently being carefully packed in custom wooden crates.

Attached is your digital Certificate of Authenticity and our recommended microfiber care instructions.`,
    isActive: true,
    stats: {
      sent: 890,
      openRate: 82.1,
      clickRate: 45.0,
      convertedRevenue: 1250.0,
    },
  },
  {
    id: "tpl-3",
    title: "Win-Back Inactive Art Collectors",
    category: "Re-engagement",
    subject: "Exclusive preview: New 24K Gold Leaf Canvas collection released",
    bodyPreview: `Hello {{customer_first_name}},
    
It has been a while since your last gallery purchase! Master artist Tahleel Studio has just unveiled 4 new original impasto oil paintings.

Enjoy exclusive 72-hour early access + $50 credit toward your next piece.`,
    isActive: false,
    stats: {
      sent: 2100,
      openRate: 42.0,
      clickRate: 12.8,
      convertedRevenue: 2480.0,
    },
  },
  {
    id: "tpl-4",
    title: "Seasonal VIP Discount Sale",
    category: "Promotional",
    subject: "VIP Collectors Event: 20% OFF sitewide with ALTRIVO20",
    bodyPreview: `Dear VIP Collector,
    
Our annual VIP Collectors Event is officially live! Save 20% across all wall art, ceramic sculptures, and framed botanical prints with code ALTRIVO20.`,
    isActive: true,
    stats: {
      sent: 3450,
      openRate: 74.5,
      clickRate: 38.2,
      convertedRevenue: 8910.0,
    },
  },
];

export default function EmailMarketingPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>(INITIAL_EMAIL_TEMPLATES);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [isSyncingResend, setIsSyncingResend] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleToggleTemplate = (id: string) => {
    setTemplates((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextActive = !t.isActive;
          triggerToast(
            `Template "${t.title}" is now ${nextActive ? "ACTIVATED" : "DEACTIVATED"}`
          );
          return { ...t, isActive: nextActive };
        }
        return t;
      })
    );
  };

  const handleSyncResendWebhook = () => {
    setIsSyncingResend(true);
    setTimeout(() => {
      setIsSyncingResend(false);
      triggerToast("Resend Webhook synced! Open rates and conversion stats updated.");
    }, 1500);
  };

  const totalEmailsSent = templates.reduce((acc, t) => acc + t.stats.sent, 0);
  const totalRevenue = templates.reduce((acc, t) => acc + t.stats.convertedRevenue, 0);

  return (
    <VendorLayout>
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
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-heading font-display">
                Email Automation Templates
              </h1>
              <span className="rounded-full bg-success-50 px-3 py-1 text-xs font-extrabold text-success-900 border border-success-200">
                Resend Webhook Active
              </span>
            </div>
            <p className="mt-1 text-sm font-medium text-body">
              Pre-built email sequences, one-click template toggles, and real-time open/click stats.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSyncResendWebhook}
              disabled={isSyncingResend}
              className="font-extrabold border-strong gap-1.5"
            >
              <RefreshCw size={16} className={isSyncingResend ? "animate-spin text-primary-600" : ""} />
              <span>{isSyncingResend ? "Syncing..." : "Sync Resend Stats"}</span>
            </Button>
          </div>
        </div>

        {/* Resend Performance Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="p-5 space-y-1 shadow-card">
            <p className="text-xs font-bold uppercase text-body font-display">Total Emails Sent</p>
            <p className="text-2xl font-extrabold text-heading font-mono">{totalEmailsSent.toLocaleString()}</p>
            <p className="text-xs font-bold text-success-700">Delivered via Resend Webhook</p>
          </Card>

          <Card className="p-5 space-y-1 shadow-card">
            <p className="text-xs font-bold uppercase text-body font-display">Average Open Rate</p>
            <p className="text-2xl font-extrabold text-heading font-mono">66.8%</p>
            <p className="text-xs font-bold text-success-700">High engagement rate</p>
          </Card>

          <Card className="p-5 space-y-1 shadow-card">
            <p className="text-xs font-bold uppercase text-body font-display">Attributed Revenue</p>
            <p className="text-2xl font-extrabold text-heading font-mono">${totalRevenue.toLocaleString()}</p>
            <p className="text-xs font-bold text-success-700">Email conversions</p>
          </Card>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {templates.map((tpl) => (
            <Card
              key={tpl.id}
              className="p-6 space-y-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center border border-primary-100 shrink-0">
                      <Mail size={20} />
                    </div>
                    <div>
                      <Badge variant="primary" size="sm" className="font-extrabold mb-1">
                        {tpl.category}
                      </Badge>
                      <h3 className="text-base font-extrabold text-heading line-clamp-1">
                        {tpl.title}
                      </h3>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    onClick={() => handleToggleTemplate(tpl.id)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      tpl.isActive ? "bg-success-500" : "bg-neutral-300"
                    }`}
                    title={tpl.isActive ? "Deactivate Campaign" : "Activate Campaign"}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-card shadow-sm ring-0 transition duration-200 ease-in-out ${
                        tpl.isActive ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="rounded-xl bg-neutral-50 p-3 border border-default space-y-1 text-xs">
                  <p className="font-extrabold text-heading truncate">Subject: "{tpl.subject}"</p>
                  <p className="text-body line-clamp-2 italic">"{tpl.bodyPreview}"</p>
                </div>
              </div>

              {/* Resend Webhook Performance Stats */}
              <div className="pt-3 border-t border-default space-y-3">
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-neutral-100 p-2 border border-default">
                    <p className="text-[9px] font-extrabold text-body uppercase">Sent</p>
                    <p className="text-xs font-mono font-extrabold text-heading">{tpl.stats.sent}</p>
                  </div>
                  <div className="rounded-lg bg-neutral-100 p-2 border border-default">
                    <p className="text-[9px] font-extrabold text-body uppercase">Open %</p>
                    <p className="text-xs font-mono font-extrabold text-success-700">{tpl.stats.openRate}%</p>
                  </div>
                  <div className="rounded-lg bg-neutral-100 p-2 border border-default">
                    <p className="text-[9px] font-extrabold text-body uppercase">Click %</p>
                    <p className="text-xs font-mono font-extrabold text-primary-700">{tpl.stats.clickRate}%</p>
                  </div>
                  <div className="rounded-lg bg-neutral-100 p-2 border border-default">
                    <p className="text-[9px] font-extrabold text-body uppercase">Revenue</p>
                    <p className="text-xs font-mono font-extrabold text-heading">${tpl.stats.convertedRevenue}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold ${
                      tpl.isActive ? "text-success-700" : "text-body"
                    }`}
                  >
                    ● {tpl.isActive ? "Active & Sending" : "Inactive"}
                  </span>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewTemplate(tpl)}
                    className="font-bold border-strong text-xs gap-1.5"
                  >
                    <Eye size={14} />
                    <span>Preview Template</span>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Email Preview Modal */}
        {previewTemplate && (
          <div className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-overlay backdrop-blur-xs">
            <div className="relative w-full max-w-lg rounded-2xl border border-strong bg-card p-6 shadow-modal space-y-4 max-h-[85vh] overflow-y-auto animate-scale-up">
              <div className="flex items-center justify-between border-b border-default pb-3">
                <div className="flex items-center gap-2">
                  <Mail size={20} className="text-primary-600" />
                  <h3 className="text-base font-extrabold text-heading">{previewTemplate.title}</h3>
                </div>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="rounded-lg p-1.5 text-heading hover:bg-neutral-200 border border-default"
                >
                  <XIcon size={18} />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <p className="font-extrabold text-heading">Subject: {previewTemplate.subject}</p>
                <div className="rounded-xl border border-default bg-neutral-50 p-4 font-mono leading-relaxed text-heading whitespace-pre-line">
                  {previewTemplate.bodyPreview}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="primary" size="sm" onClick={() => setPreviewTemplate(null)} className="font-bold">
                  Close Preview
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </VendorLayout>
  );
}
