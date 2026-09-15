"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Store,
  Sparkles,
  Plus,
  Eye,
  Pencil,
  Wand2,
  Globe,
  Trash2,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  Loader2,
  ExternalLink,
  LayoutDashboard,
  Check,
  AlertTriangle,
} from "lucide-react";
import { useVendorStore } from "@/context/VendorStoreContext";

interface StoreItem {
  id: string;
  name: string;
  slug: string;
  niche: string;
  description: string | null;
  is_published: boolean;
  is_generating: boolean;
  subdomain: string | null;
  custom_domain: string | null;
  created_at: string;
  updated_at: string;
  layout_config: any;
}

export default function MyStoresPage() {
  const { activeStore, activeStoreId, setActiveStoreId, refreshStores } = useVendorStore();
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showAllStores, setShowAllStores] = useState(false);

  // Delete modal states
  const [storeToDelete, setStoreToDelete] = useState<StoreItem | null>(null);
  const [deleteAcknowledged, setDeleteAcknowledged] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Fetch stores on mount
  useEffect(() => {
    // Clear legacy un-isolated local storage to prevent cross-account leakage
    try {
      localStorage.removeItem("digishop_stores");
    } catch {}
    fetchStores();
  }, []);

  async function fetchStores() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/stores");
      if (res.ok) {
        const data = await res.json();
        setStores(Array.isArray(data.stores) ? data.stores : []);
        return;
      }
      setStores([]);
    } catch (err) {
      console.error("Failed to fetch stores:", err);
      setStores([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleConfirmDelete() {
    if (!storeToDelete || !deleteAcknowledged) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/stores/${storeToDelete.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete store. Please try again.");
      }

      const remaining = stores.filter((s) => s.id !== storeToDelete.id);
      setStores(remaining);

      // If active store was deleted, switch to next remaining store
      const nextStore = remaining.length > 0 ? remaining[0] : null;
      if (storeToDelete.id === (activeStoreId || activeStore?.id)) {
        if (nextStore) {
          setActiveStoreId(nextStore.id);
        }
      }

      // Sync context across tabs / components
      if (refreshStores) {
        await refreshStores(nextStore?.id);
      }

      setStoreToDelete(null);
      setDeleteAcknowledged(false);
    } catch (err: any) {
      console.error("Failed to delete store:", err);
      setDeleteError(err.message || "An error occurred while deleting the store.");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handlePublish(storeId: string) {
    try {
      const res = await fetch(`/api/stores/${storeId}/publish`, { method: "POST" });
      if (res.ok) {
        fetchStores(); // refresh list
      }
    } catch (err) {
      console.error("Failed to publish store:", err);
    }
  }

  function getSectionCount(store: StoreItem): number {
    return store.layout_config?.sections?.length || 0;
  }

  function getStoreUrl(store: StoreItem): string {
    if (store.custom_domain) return `https://${store.custom_domain}`;
    if (store.subdomain) return `https://${store.subdomain}.digishop.ai`;
    return `https://${store.slug}.digishop.ai`;
  }

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 select-none pb-16">
      {/* Top Header */}
      <div className="border-b border-default bg-card shadow-2xs sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 text-white flex items-center justify-center shadow-md">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-heading font-display tracking-tight">
                My Active Store
              </h1>
              <p className="text-xs text-subtle font-medium">
                {stores.length > 0
                  ? `Currently viewing open store: ${activeStore?.name || stores[0]?.name || "Active Store"}`
                  : "No active storefront created yet"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-8 h-8 text-accent-600 animate-spin" />
            <p className="text-sm text-subtle font-medium">Loading your stores...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && stores.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 gap-6 bg-card rounded-3xl border border-default p-8 shadow-card">
            <div className="p-6 rounded-2xl bg-primary-50 border border-primary-200">
              <Store className="w-12 h-12 text-primary-600" />
            </div>
            <div className="text-center space-y-2 max-w-md">
              <h2 className="text-xl font-black text-heading font-display">No stores created yet</h2>
              <p className="text-xs text-subtle leading-relaxed">
                Create your first AI-powered store in seconds. Just describe your business and let AI generate full storefront sections and layout.
              </p>
            </div>
            <Link
              href="/store-builder"
              className="px-6 py-3 rounded-xl bg-[#694873] hover:bg-[#5A3D63] text-white font-extrabold text-xs shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Store</span>
            </Link>
          </div>
        )}

        {/* Store Cards Grid */}
        {/* Store Cards Grid - Strictly Only The Active Store */}
        {!isLoading && stores.length > 0 && (() => {
          const currentStore = stores.find((s) => s.id === (activeStoreId || activeStore?.id)) || stores[0];
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[currentStore].map((store) => {
                const isCurrent = true;
                return (
              <div
                key={store.id}
                className={`group rounded-3xl bg-card border shadow-card hover:shadow-card-hover transition-all duration-normal overflow-hidden flex flex-col justify-between ${
                  isCurrent ? "border-primary-400 ring-2 ring-primary-400/20" : "border-default"
                }`}
              >
                {/* Store Color Header Bar */}
                <div
                  className="h-2.5 w-full shadow-2xs"
                  style={{
                    background: `linear-gradient(90deg, ${store.layout_config?.theme?.colors?.primary || "#3B2742"} 0%, ${store.layout_config?.theme?.colors?.secondary || "#F2B8D2"} 100%)`,
                  }}
                />

                {/* Store Info */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  {/* Top row: name + status + menu */}
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-black text-heading font-display tracking-tight truncate">
                          {store.name}
                        </h3>
                        <p className="text-xs text-subtle font-mono mt-0.5 truncate">
                          /{store.slug}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isCurrent && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-50 border border-primary-300 text-primary-800 text-[11px] font-extrabold shadow-2xs">
                            <Check className="w-3.5 h-3.5 text-primary-600" />
                            Active
                          </span>
                        )}

                        {/* Status Badge */}
                        {store.is_published ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-success-50 border border-success-200 text-success-800 text-[11px] font-extrabold shadow-2xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-success-600" />
                            Live
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-warning-50 border border-warning-200 text-warning-800 text-[11px] font-extrabold shadow-2xs">
                            <Clock className="w-3.5 h-3.5 text-warning-600" />
                            Draft
                          </span>
                        )}

                        {/* Menu */}
                        <div className="relative">
                          <button
                            onClick={() => setActiveMenu(activeMenu === store.id ? null : store.id)}
                            className="p-1.5 rounded-xl hover:bg-neutral-100 text-subtle hover:text-heading transition-colors border border-transparent hover:border-default cursor-pointer"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>

                          {activeMenu === store.id && (
                            <>
                              <div className="fixed inset-0 z-30" onClick={() => setActiveMenu(null)} />
                              <div className="absolute right-0 top-8 z-40 w-48 py-1.5 rounded-2xl bg-card border border-default shadow-2xl">
                                {!store.is_published && (
                                  <button
                                    onClick={() => { handlePublish(store.id); setActiveMenu(null); }}
                                    className="w-full px-4 py-2.5 text-left text-xs font-semibold text-heading hover:bg-neutral-100 flex items-center gap-2.5 transition-colors cursor-pointer"
                                  >
                                    <Globe className="w-4 h-4 text-primary-600" />
                                    Publish Store
                                  </button>
                                )}
                                {store.is_published && (
                                  <a
                                    href={getStoreUrl(store)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full px-4 py-2.5 text-left text-xs font-semibold text-heading hover:bg-neutral-100 flex items-center gap-2.5 transition-colors cursor-pointer"
                                  >
                                    <ExternalLink className="w-4 h-4 text-accent-600" />
                                    View Live Store
                                  </a>
                                )}
                                <button
                                  onClick={() => {
                                    setStoreToDelete(store);
                                    setDeleteAcknowledged(false);
                                    setDeleteError(null);
                                    setActiveMenu(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-xs font-bold text-error-600 hover:bg-error-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span>Delete Store</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {store.description ? (
                      <p className="text-xs text-body line-clamp-2 leading-relaxed mt-2.5 font-medium">
                        {store.description}
                      </p>
                    ) : (
                      <p className="text-xs text-subtle line-clamp-2 leading-relaxed mt-2.5 italic">
                        Handcrafted custom eCommerce store powered by AI.
                      </p>
                    )}
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center gap-4 text-xs text-subtle font-medium border-t border-default/60 pt-3">
                    <span className="flex items-center gap-1.5">
                      <LayoutDashboard className="w-3.5 h-3.5 text-subtle" />
                      {getSectionCount(store)} sections
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-subtle" />
                      {formatDate(store.updated_at)}
                    </span>
                    {store.niche && store.niche !== "general" && (
                      <span className="px-2 py-0.5 rounded-lg bg-neutral-100 text-heading text-[10px] font-bold uppercase tracking-wider">
                        {store.niche}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-2.5 pt-2">
                    <a
                      href={`/store/${store.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-95 cursor-pointer"
                      title="View Live Storefront"
                    >
                      <Eye className="w-3.5 h-3.5 text-purple-600" />
                      <span>View</span>
                    </a>
                    <Link
                      href={`/dashboard/editor/${store.slug}`}
                      className="px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-default text-xs font-bold text-heading flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-95 cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5 text-subtle" />
                      <span>Editor</span>
                    </Link>
                    <Link
                      href={`/store-builder/chat?storeId=${store.id}`}
                      className="px-3 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-xs font-extrabold text-white flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>AI Edit</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
          );
        })()}
      </div>

      {/* Store Delete Confirmation Modal */}
      {storeToDelete && (
        <div 
          className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => {
            if (!isDeleting) {
              setStoreToDelete(null);
              setDeleteAcknowledged(false);
            }
          }}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-white border border-red-100 shadow-2xl overflow-hidden p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 flex-shrink-0 shadow-xs">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Permanently Delete Store?
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  This action is permanent and irreversible. Once deleted, this store and its data cannot be restored.
                </p>
              </div>
            </div>

            {/* Target Store Badge */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {storeToDelete.name}
                </p>
                <p className="text-[11px] font-mono text-slate-500 truncate">
                  /{storeToDelete.slug}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-red-100/70 text-red-700 text-[10px] font-black uppercase tracking-wider flex-shrink-0">
                To Be Erased
              </span>
            </div>

            {/* Warning Breakdown */}
            <div className="p-4 rounded-2xl bg-red-50/60 border border-red-200/80 text-xs text-red-900 space-y-2">
              <h4 className="font-extrabold flex items-center gap-1.5 text-red-800">
                <span>⚠️ Important Consequences:</span>
              </h4>
              <ul className="space-y-1.5 text-[11px] text-red-700/90 list-disc list-inside leading-relaxed font-medium">
                <li>Storefront website (<span className="font-mono font-bold">/{storeToDelete.slug}</span>) will immediately go offline.</li>
                <li>All layout sections, custom designs, banners, and catalog products will be permanently deleted from the database.</li>
                <li>All customer records, tracking timelines, and orders for this specific store will be permanently erased.</li>
                <li><span className="font-bold">Your vendor account and all other stores will remain completely safe and active.</span></li>
              </ul>
            </div>

            {/* Confirmation Checkbox */}
            <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50/80 transition-colors cursor-pointer select-none">
              <input
                type="checkbox"
                checked={deleteAcknowledged}
                onChange={(e) => setDeleteAcknowledged(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-red-600 border-slate-300 focus:ring-red-500 cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-700 leading-snug">
                I understand that deleting this store will permanently wipe all associated data, layouts, and orders from the database, and cannot be undone.
              </span>
            </label>

            {deleteError && (
              <p className="text-xs font-bold text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
                {deleteError}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (!isDeleting) {
                    setStoreToDelete(null);
                    setDeleteAcknowledged(false);
                  }
                }}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={!deleteAcknowledged || isDeleting}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md shadow-red-600/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting Store...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Store Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
