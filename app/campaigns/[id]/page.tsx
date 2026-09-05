"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Campaign, CampaignStatus } from "@/types/campaigns";
import { getCampaignById } from "@/utils/campaignsMock";
import { VendorLayout } from "@/components/vendor/VendorLayout";
import { Button, Card, Badge } from "@/components/shared";
import {
  Megaphone,
  Play,
  Pause,
  TrendingUp,
  RefreshCw,
  Target,
  CreditCard,
  CheckCircle2,
  Package,
  ArrowRight,
  ShieldCheck,
} from "@/components/shared/LucideIcons";

export default function CampaignDetailPage() {
  const resolvedParams = useParams() as { id: string };
  const initialCampaign = getCampaignById(resolvedParams.id);
  const [campaign, setCampaign] = useState<Campaign>(initialCampaign);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleToggleStatus = () => {
    const newStatus: CampaignStatus = campaign.status === "Active" ? "Paused" : "Active";
    setCampaign((prev) => ({ ...prev, status: newStatus }));
    triggerToast(`Campaign status updated to ${newStatus} on Meta Sandbox API!`);
  };

  const handleSyncMeta = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      triggerToast("Meta Sandbox API synced cleanly (0 errors). Data updated!");
    }, 1500);
  };

  return (
    <VendorLayout>
      <div className="space-y-6 animate-fade-in pb-16">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-toast flex items-center gap-3 rounded-2xl border border-success-300 bg-success-50 px-5 py-3.5 shadow-modal animate-bounce">
            <CheckCircle2 size={20} className="text-success-600 shrink-0" />
            <span className="text-sm font-extrabold text-success-950">{toastMessage}</span>
          </div>
        )}

        {/* Header Navigation */}
        <nav className="flex items-center gap-2 text-xs font-bold text-heading">
          <Link href="/campaigns" className="hover:text-primary-600 hover:underline">
            Campaigns
          </Link>
          <span>/</span>
          <span className="text-body font-normal truncate">{campaign.name}</span>
        </nav>

        {/* Top Header Card */}
        <Card className="p-6 space-y-4 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={campaign.productImage}
                alt={campaign.productTitle}
                className="h-16 w-16 rounded-2xl object-cover border border-default shrink-0 shadow-xs"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-heading font-display tracking-tight">
                    {campaign.name}
                  </h1>
                  <Badge
                    variant={campaign.status === "Active" ? "success" : "warning"}
                    size="sm"
                    className="font-extrabold"
                  >
                    {campaign.status}
                  </Badge>
                </div>
                <p className="text-xs font-semibold text-body mt-0.5">
                  Target Product: <strong className="text-heading font-bold">{campaign.productTitle}</strong>
                </p>
                <p className="text-[11px] font-mono text-body font-bold mt-0.5">
                  Meta Sandbox ID: {campaign.metaSandboxId} | Payment: {campaign.paymentMethod}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSyncMeta}
                disabled={isSyncing}
                className="font-extrabold border-strong gap-1.5"
              >
                <RefreshCw size={16} className={isSyncing ? "animate-spin text-primary-600" : ""} />
                <span>{isSyncing ? "Syncing..." : "Sync Meta API"}</span>
              </Button>

              <Button
                variant={campaign.status === "Active" ? "ghost" : "primary"}
                size="md"
                onClick={handleToggleStatus}
                className="font-extrabold shadow-md gap-2 border-strong"
              >
                {campaign.status === "Active" ? <Pause size={18} /> : <Play size={18} />}
                <span>{campaign.status === "Active" ? "Pause Campaign" : "Resume Campaign"}</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* Analytics Performance Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-5 space-y-1 shadow-card">
            <p className="text-xs font-bold uppercase text-body font-display">Impressions</p>
            <p className="text-2xl font-extrabold text-heading font-mono">{campaign.impressions.toLocaleString()}</p>
            <p className="text-xs font-bold text-success-700">+12% reach growth</p>
          </Card>

          <Card className="p-5 space-y-1 shadow-card">
            <p className="text-xs font-bold uppercase text-body font-display">Ad Clicks</p>
            <p className="text-2xl font-extrabold text-heading font-mono">{campaign.clicks.toLocaleString()}</p>
            <p className="text-xs font-bold text-success-700">CTR: {campaign.ctr.toFixed(1)}%</p>
          </Card>

          <Card className="p-5 space-y-1 shadow-card">
            <p className="text-xs font-bold uppercase text-body font-display">ROAS Return</p>
            <p className="text-2xl font-extrabold text-heading font-mono">{campaign.roas.toFixed(1)}x</p>
            <p className="text-xs font-bold text-success-700">Return on Ad Spend</p>
          </Card>

          <Card className="p-5 space-y-1 shadow-card">
            <p className="text-xs font-bold uppercase text-body font-display">Total Ad Spend</p>
            <p className="text-2xl font-extrabold text-heading font-mono">${campaign.spend.toFixed(2)}</p>
            <p className="text-xs font-bold text-body">Budget: ${campaign.totalBudget.toFixed(2)}</p>
          </Card>
        </div>

        {/* Performance Chart over Time */}
        <Card className="p-6 space-y-4 shadow-card">
          <h2 className="text-base font-extrabold text-heading font-display">
            Daily Impressions & Conversion Trends (Meta Sandbox Data)
          </h2>
          <div className="h-44 rounded-xl bg-neutral-50 p-4 border border-default flex items-end justify-between gap-3">
            {[
              { day: "Day 1", height: "30%", val: "2.4k" },
              { day: "Day 2", height: "45%", val: "4.1k" },
              { day: "Day 3", height: "60%", val: "6.8k" },
              { day: "Day 4", height: "80%", val: "9.2k" },
              { day: "Day 5", height: "70%", val: "8.1k" },
              { day: "Day 6", height: "95%", val: "11.4k" },
              { day: "Day 7", height: "85%", val: "10.2k" },
            ].map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[10px] font-mono font-bold text-body">{bar.val}</span>
                <div
                  className="w-full rounded-t-lg bg-primary-500 hover:bg-primary-600 transition-all shadow-xs"
                  style={{ height: bar.height }}
                />
                <span className="text-xs font-extrabold text-heading">{bar.day}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Best Performing Creatives List */}
        <Card className="p-6 space-y-4 shadow-card">
          <h2 className="text-base font-extrabold text-heading font-display">
            Top Performing Ad Creatives
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {campaign.creatives.map((cr) => (
              <div
                key={cr.id}
                className="flex gap-4 rounded-xl border border-default bg-card p-4 shadow-xs"
              >
                <img
                  src={cr.image}
                  alt={cr.headline}
                  className="h-20 w-20 rounded-xl object-cover border border-default shrink-0"
                />
                <div className="space-y-1">
                  <h3 className="text-xs font-extrabold text-heading">{cr.headline}</h3>
                  <p className="text-[11px] font-medium text-body italic">"{cr.primaryText}"</p>
                  <div className="flex items-center gap-4 text-xs font-mono font-bold pt-1 text-success-700">
                    <span>CTR: {cr.ctr}%</span>
                    <span>Conversions: {cr.conversions}</span>
                    <span>Conv Rate: {cr.conversionRate}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Targeting & Budget Specs */}
        <Card className="p-6 space-y-4 shadow-card">
          <h2 className="text-base font-extrabold text-heading font-display">
            AI Smart Targeting & Demographics Config
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
            <div className="rounded-xl bg-neutral-50 p-4 border border-default space-y-2">
              <p className="font-extrabold text-heading uppercase">Target Demographics</p>
              <p className="text-body">Age Range: <strong className="text-heading font-bold">{campaign.targeting.minAge} - {campaign.targeting.maxAge} years</strong></p>
              <p className="text-body">Gender: <strong className="text-heading font-bold">{campaign.targeting.gender}</strong></p>
              <p className="text-body">Target Cities: <strong className="text-heading font-bold">{campaign.targeting.cities.join(", ")}</strong></p>
            </div>

            <div className="rounded-xl bg-neutral-50 p-4 border border-default space-y-2">
              <p className="font-extrabold text-heading uppercase">Interests & Behaviors</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {campaign.targeting.interests.map((int, i) => (
                  <Badge key={i} variant="primary" size="sm" className="font-extrabold">
                    {int}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </VendorLayout>
  );
}
