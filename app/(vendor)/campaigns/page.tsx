"use client";

import { useState } from "react";
import Link from "next/link";
import { Campaign, CampaignStatus } from "@/types/campaigns";
import { INITIAL_CAMPAIGNS } from "@/utils/campaignsMock";
import { Button, Card, Badge } from "@/components/shared";
import {
  Plus,
  Play,
  Pause,
  Search,
  Filter,
  CheckCircle2,
  ChevronRight,
} from "@/components/shared/LucideIcons";

export default function CampaignsListPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleToggleStatus = (campaignId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === campaignId) {
          const newStatus: CampaignStatus = c.status === "Active" ? "Paused" : "Active";
          triggerToast(`Campaign "${c.name}" status updated to ${newStatus}`);
          return { ...c, status: newStatus };
        }
        return c;
      })
    );
  };

  const filteredCampaigns = campaigns.filter((c) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        c.name.toLowerCase().includes(q) ||
        c.productTitle.toLowerCase().includes(q) ||
        c.metaSandboxId.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (statusFilter !== "all" && c.status.toLowerCase() !== statusFilter) {
      return false;
    }

    return true;
  });

  const totalImpressions = campaigns.reduce((acc, c) => acc + c.impressions, 0);
  const avgRoas = (
    campaigns.reduce((acc, c) => acc + c.roas, 0) / (campaigns.length || 1)
  ).toFixed(1);

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-toast flex items-center gap-3 rounded-2xl border border-success-300 bg-success-50 px-5 py-3.5 shadow-modal animate-bounce">
          <CheckCircle2 size={20} className="text-success-600 shrink-0" />
          <span className="text-sm font-extrabold text-success-950">{toastMessage}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-heading font-display">
              Meta Ad Campaigns
            </h1>
            <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-extrabold text-primary-900 border border-primary-200">
              Meta Sandbox API Connected
            </span>
          </div>
          <p className="mt-1 text-sm font-medium text-body">
            Create AI-powered Meta ad campaigns, track live ROAS performance, and manage VCC funding.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/campaigns/new">
            <Button variant="primary" size="md" className="font-extrabold shadow-md gap-2">
              <Plus size={18} />
              <span>+ Create Campaign (AI Wizard)</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-5 space-y-1 shadow-card">
          <p className="text-xs font-bold uppercase text-body font-display">Total Impressions</p>
          <p className="text-2xl font-extrabold text-heading font-mono">{totalImpressions.toLocaleString()}</p>
          <p className="text-xs font-bold text-success-700">Live Meta Ad Reach</p>
        </Card>

        <Card className="p-5 space-y-1 shadow-card">
          <p className="text-xs font-bold uppercase text-body font-display">Average ROAS</p>
          <p className="text-2xl font-extrabold text-heading font-mono">{avgRoas}x</p>
          <p className="text-xs font-bold text-success-700">Return on Ad Spend</p>
        </Card>

        <Card className="p-5 space-y-1 shadow-card">
          <p className="text-xs font-bold uppercase text-body font-display">Funding Payment Method</p>
          <p className="text-sm font-extrabold text-heading font-mono">Virtual Credit Card (VCC)</p>
          <Link href="/wallet" className="text-xs font-extrabold text-primary-700 hover:underline">
            Manage VCC Balance ($1,500.00) →
          </Link>
        </Card>
      </div>

      {/* Search & Status Filter */}
      <div className="rounded-2xl border border-default bg-card p-5 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Search size={16} className="text-body" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campaigns by name, product, or Meta ID..."
            className="w-full rounded-xl border border-default bg-input py-2.5 pl-10 pr-4 text-sm font-semibold text-heading placeholder:text-body/70 focus:border-focus focus:outline-none shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={16} className="text-body shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto rounded-xl border border-default bg-input px-3.5 py-2 text-xs font-semibold text-heading focus:outline-none shadow-xs"
          >
            <option value="all">All Campaign Statuses</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Campaigns Table */}
      <Card className="overflow-hidden shadow-card border-default">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold">
            <thead className="bg-neutral-100 uppercase text-[11px] text-heading font-extrabold border-b border-default">
              <tr>
                <th className="py-3.5 px-4">Campaign & Product</th>
                <th className="py-3.5 px-4">Daily Budget</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Impressions</th>
                <th className="py-3.5 px-4 text-right">CTR (%)</th>
                <th className="py-3.5 px-4 text-right">ROAS</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-default bg-card text-heading">
              {filteredCampaigns.map((cmp) => (
                <tr
                  key={cmp.id}
                  className="hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  <td className="py-4 px-4">
                    <Link href={`/campaigns/${cmp.id}`} className="flex items-center gap-3">
                      <img
                        src={cmp.productImage}
                        alt={cmp.name}
                        className="h-12 w-12 rounded-xl object-cover border border-default shrink-0"
                      />
                      <div>
                        <p className="font-extrabold text-heading text-sm hover:text-primary-600 transition-colors">
                          {cmp.name}
                        </p>
                        <p className="text-[11px] font-medium text-body truncate max-w-xs">
                          {cmp.productTitle}
                        </p>
                        <p className="text-[10px] font-mono text-body font-bold">
                          Meta ID: {cmp.metaSandboxId}
                        </p>
                      </div>
                    </Link>
                  </td>

                  <td className="py-4 px-4">
                    <p className="font-mono font-extrabold text-heading">${cmp.dailyBudget.toFixed(2)}/day</p>
                    <p className="text-[11px] text-body">Spent: ${cmp.spend.toFixed(2)}</p>
                  </td>

                  <td className="py-4 px-4">
                    <Badge
                      variant={cmp.status === "Active" ? "success" : cmp.status === "Paused" ? "warning" : "gray"}
                      size="sm"
                      className="font-extrabold"
                    >
                      {cmp.status}
                    </Badge>
                  </td>

                  <td className="py-4 px-4 text-right font-mono font-extrabold">
                    {cmp.impressions.toLocaleString()}
                  </td>

                  <td className="py-4 px-4 text-right font-mono font-extrabold text-success-700">
                    {cmp.ctr.toFixed(1)}%
                  </td>

                  <td className="py-4 px-4 text-right font-mono font-extrabold text-primary-700 text-sm">
                    {cmp.roas.toFixed(1)}x
                  </td>

                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleToggleStatus(cmp.id, e)}
                        className="font-bold border-default text-xs p-1.5"
                        title={cmp.status === "Active" ? "Pause Campaign" : "Resume Campaign"}
                      >
                        {cmp.status === "Active" ? <Pause size={14} /> : <Play size={14} />}
                      </Button>

                      <Link href={`/campaigns/${cmp.id}`}>
                        <Button variant="ghost" size="sm" className="font-bold border-strong text-xs gap-1">
                          <span>Details</span>
                          <ChevronRight size={14} />
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
