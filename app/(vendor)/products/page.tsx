"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus } from "lucide-react";

import {
  Button,
  Badge,
  Input,
  Select,
  Checkbox,
  Pagination,
  EmptyState,
  ConfirmDialog,
} from "@/components/shared";
import { ProductQuickViewModal } from "@/components/products/ProductQuickViewModal";
import { useProducts } from "@/hooks/useProducts";
import { useVendorStore } from "@/context/VendorStoreContext";
import { getCategoryDefaultImage, isValidImageUrl } from "@/lib/product-storage";
import type { Product, ProductStatus, ProductSortField } from "@/types/product";

const statusConfig: Record<
  ProductStatus,
  { label: string; variant: "success" | "gray" | "warning" }
> = {
  published: { label: "Published", variant: "success" },
  draft: { label: "Draft", variant: "gray" },
  "out-of-stock": { label: "Out of Stock", variant: "warning" },
};

const sortOptions = [
  { value: "updatedAt-desc", label: "Last Updated (Newest)" },
  { value: "updatedAt-asc", label: "Last Updated (Oldest)" },
  { value: "name-asc", label: "Name (A–Z)" },
  { value: "name-desc", label: "Name (Z–A)" },
  { value: "price-desc", label: "Price (High–Low)" },
  { value: "price-asc", label: "Price (Low–High)" },
  { value: "stock-asc", label: "Stock (Low–High)" },
  { value: "stock-desc", label: "Stock (High–Low)" },
];

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M14 14l-3.5-3.5M11 6.5a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10.5 3.5L3.5 10.5M3.5 3.5l7 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SortArrow({
  field,
  currentField,
  direction,
}: {
  field: ProductSortField;
  currentField: ProductSortField;
  direction: "asc" | "desc";
}) {
  if (field !== currentField) {
    return (
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        className="opacity-0 group-hover:opacity-40 transition-opacity"
        aria-hidden="true"
      >
        <path
          d="M6 2.5v7M3.5 7L6 9.5 8.5 7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      className="text-primary-500"
      aria-hidden="true"
    >
      {direction === "asc" ? (
        <path
          d="M6 9.5v-7M3.5 5L6 2.5 8.5 5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M6 2.5v7M3.5 7L6 9.5 8.5 7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export default function ProductsPage() {
  const router = useRouter();
  const { stores, activeStore, activeStoreId, setActiveStoreId } = useVendorStore();

  const {
    filters,
    updateFilter,
    resetFilters,
    hasActiveFilters,
    setSort,
    products,
    filteredCount,
    totalProductsCount,
    totalPages,
    currentPage,
    setCurrentPage,
    pageSize,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    selectAllFiltered,
    clearSelection,
    deleteProduct,
    duplicateProduct,
    bulkDelete,
    bulkChangeCategory,
    bulkChangeStatus,
    toggleProductStatus,
    categories,
  } = useProducts(activeStoreId || undefined);

  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    description: React.ReactNode;
    confirmLabel?: string;
    confirmVariant?: "primary" | "danger";
    onConfirm: () => void;
  } | null>(null);

  const [bulkCategoryOpen, setBulkCategoryOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const allPageSelected =
    products.length > 0 && products.every((p) => selectedIds.has(p.id));
  const someSelected = selectedIds.size > 0;
  const indeterminate = someSelected && !allPageSelected;

  const handleSortChange = (value: string) => {
    const [field, dir] = value.split("-") as [ProductSortField, "asc" | "desc"];
    updateFilter("sortField", field);
    updateFilter("sortDirection", dir);
  };

  const handleBulkDelete = () => {
    const count = selectedIds.size;
    setConfirmAction({
      title: "Delete Selected Products",
      description: `Are you sure you want to delete ${count} selected product${
        count > 1 ? "s" : ""
      }? This action cannot be undone.`,
      confirmLabel: `Delete ${count} Product${count > 1 ? "s" : ""}`,
      confirmVariant: "danger",
      onConfirm: () => {
        bulkDelete();
        setConfirmAction(null);
      },
    });
  };

  const handleBulkStatus = (status: ProductStatus) => {
    const label = statusConfig[status].label;
    const count = selectedIds.size;
    setConfirmAction({
      title: `Mark Products as ${label}`,
      description: `Are you sure you want to change status of ${count} selected product${
        count > 1 ? "s" : ""
      } to "${label}"?`,
      confirmLabel: `Mark as ${label}`,
      confirmVariant: "primary",
      onConfirm: () => {
        bulkChangeStatus(status);
        setConfirmAction(null);
      },
    });
  };

  const handleBulkCategorySelect = (category: string) => {
    setBulkCategoryOpen(false);
    const count = selectedIds.size;
    setConfirmAction({
      title: "Change Category",
      description: `Are you sure you want to change the category of ${count} selected product${
        count > 1 ? "s" : ""
      } to "${category}"?`,
      confirmLabel: `Set to ${category}`,
      confirmVariant: "primary",
      onConfirm: () => {
        bulkChangeCategory(category);
        setConfirmAction(null);
      },
    });
  };

  const handleSingleDelete = (product: Product) => {
    setConfirmAction({
      title: "Delete Product",
      description: (
        <>
          Are you sure you want to delete <strong>{product.name}</strong> (
          <code className="text-xs font-mono">{product.sku}</code>)? This action
          cannot be undone.
        </>
      ),
      confirmLabel: "Delete Product",
      confirmVariant: "danger",
      onConfirm: () => {
        deleteProduct(product.id);
        setConfirmAction(null);
      },
    });
  };

  const sortValue = `${filters.sortField}-${filters.sortDirection}`;

  return (
    <div className="min-h-screen bg-page">
      <div className="mx-auto max-w-[1400px] px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-heading">Products</h1>
              <span
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                suppressHydrationWarning
              >
                {totalProductsCount.toLocaleString()} total
              </span>
            </div>
            <p className="mt-1 text-sm text-body">
              Manage and organize your vendor product catalog
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="md"
              onClick={() => router.push("/inventory")}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1.5"
              >
                <path d="M3 3h18v18H3z" />
                <path d="M3 9h18" />
                <path d="M3 15h18" />
                <path d="M9 3v18" />
                <path d="M15 3v18" />
              </svg>
              Smart Inventory
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => router.push("/products/new")}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="mr-1.5"
                aria-hidden="true"
              >
                <path
                  d="M8 3v10M3 8h10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Add Product
            </Button>
          </div>
        </div>


        {/* Filters Bar */}
        <div className="bg-card rounded-xl border border-default shadow-card">
          <div className="p-4 border-b border-default">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Input
                  icon={<SearchIcon />}
                  placeholder="Search by name or SKU..."
                  value={filters.search}
                  onChange={(e) => updateFilter("search", e.target.value)}
                />
                {filters.search && (
                  <button
                    onClick={() => updateFilter("search", "")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-heading p-1 transition-colors"
                    aria-label="Clear search"
                  >
                    <ClearIcon />
                  </button>
                )}
              </div>
              <Select
                options={[
                  { value: "", label: "All Categories" },
                  ...categories.map((c) => ({ value: c, label: c })),
                ]}
                value={filters.category}
                onChange={(e) => updateFilter("category", e.target.value)}
                className="min-w-[160px]"
              />
              <Select
                options={[
                  { value: "", label: "All Statuses" },
                  { value: "published", label: "Published" },
                  { value: "draft", label: "Draft" },
                  { value: "out-of-stock", label: "Out of Stock" },
                ]}
                value={filters.status}
                onChange={(e) => updateFilter("status", e.target.value)}
                className="min-w-[150px]"
              />
              <Select
                options={sortOptions}
                value={sortValue}
                onChange={(e) => handleSortChange(e.target.value)}
                className="min-w-[190px]"
              />
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  Clear filters
                </Button>
              )}
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {someSelected && (
            <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-primary-50/80 border-b border-primary-200 animate-in fade-in duration-200">
              <span className="text-sm font-semibold text-primary-800">
                {selectedIds.size} selected
              </span>

              {allPageSelected && selectedIds.size < filteredCount && (
                <button
                  onClick={selectAllFiltered}
                  className="text-xs font-medium text-primary-600 hover:text-primary-800 underline transition-colors"
                >
                  Select all {filteredCount.toLocaleString()} matching products
                </button>
              )}

              <div className="h-4 w-px bg-primary-200 hidden sm:block" />

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBulkStatus("published")}
                >
                  Mark Published
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBulkStatus("draft")}
                >
                  Mark Draft
                </Button>

                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setBulkCategoryOpen(!bulkCategoryOpen)}
                  >
                    Change Category
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      className="ml-1"
                      aria-hidden="true"
                    >
                      <path
                        d="M3 4.5L6 7.5l3-3"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Button>
                  {bulkCategoryOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-30"
                        onClick={() => setBulkCategoryOpen(false)}
                      />
                      <div className="absolute top-full left-0 mt-1 z-dropdown w-48 bg-card rounded-lg border border-default shadow-float overflow-hidden max-h-56 overflow-y-auto py-1">
                        {categories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => handleBulkCategorySelect(cat)}
                            className="w-full text-left px-3 py-2 text-sm text-body hover:bg-muted hover:text-heading transition-colors"
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <Button variant="danger" size="sm" onClick={handleBulkDelete}>
                  Delete
                </Button>
              </div>

              <div className="flex-1" />
              <Button variant="link" size="sm" onClick={clearSelection}>
                Clear selection
              </Button>
            </div>
          )}

          {/* Table */}
          {filteredCount === 0 ? (
            <div className="p-12 text-center">
              <EmptyState
                title={
                  hasActiveFilters
                    ? "No products found"
                    : `No products in "${activeStore?.name || "this store"}" yet`
                }
                description={
                  hasActiveFilters
                    ? "Try adjusting your search or filters to find what you're looking for."
                    : `This store catalog is currently empty. Add products specifically for ${activeStore?.name || "this store"}.`
                }
                icon={
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 48 48"
                    fill="none"
                    aria-hidden="true"
                  >
                    <rect
                      x="6"
                      y="10"
                      width="36"
                      height="28"
                      rx="4"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M6 18h36M18 18v20"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <circle
                      cx="33"
                      cy="33"
                      r="8"
                      fill="var(--bg-page)"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M36 36l4 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                }
              />
              <div className="mt-4 flex justify-center gap-3">
                {hasActiveFilters ? (
                  <Button variant="ghost" size="sm" onClick={resetFilters}>
                    Reset all filters
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => router.push("/products/new")}
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Add Product to {activeStore?.name || "Store"}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-default bg-muted/50">
                    <th className="w-12 px-4 py-3">
                      <Checkbox
                        checked={allPageSelected}
                        indeterminate={indeterminate}
                        onChange={toggleSelectAll}
                        aria-label="Select all products on this page"
                      />
                    </th>
                    <th className="w-16 px-2 py-3 text-left font-medium text-subtle uppercase text-xs tracking-wider">
                      Thumbnail
                    </th>
                    <th className="px-4 py-3 text-left">
                      <button
                        onClick={() => setSort("name")}
                        className="group inline-flex items-center gap-1 font-medium text-subtle uppercase text-xs tracking-wider hover:text-heading transition-colors"
                      >
                        Product Name
                        <SortArrow
                          field="name"
                          currentField={filters.sortField}
                          direction={filters.sortDirection}
                        />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-subtle uppercase text-xs tracking-wider">
                      SKU
                    </th>
                    <th className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSort("price")}
                        className="group inline-flex items-center gap-1 font-medium text-subtle uppercase text-xs tracking-wider hover:text-heading transition-colors ml-auto"
                      >
                        Price
                        <SortArrow
                          field="price"
                          currentField={filters.sortField}
                          direction={filters.sortDirection}
                        />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSort("stock")}
                        className="group inline-flex items-center gap-1 font-medium text-subtle uppercase text-xs tracking-wider hover:text-heading transition-colors ml-auto"
                      >
                        Stock
                        <SortArrow
                          field="stock"
                          currentField={filters.sortField}
                          direction={filters.sortDirection}
                        />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <button
                        onClick={() => setSort("category")}
                        className="group inline-flex items-center gap-1 font-medium text-subtle uppercase text-xs tracking-wider hover:text-heading transition-colors"
                      >
                        Category
                        <SortArrow
                          field="category"
                          currentField={filters.sortField}
                          direction={filters.sortDirection}
                        />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-subtle uppercase text-xs tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left">
                      <button
                        onClick={() => setSort("updatedAt")}
                        className="group inline-flex items-center gap-1 font-medium text-subtle uppercase text-xs tracking-wider hover:text-heading transition-colors"
                      >
                        Last Updated
                        <SortArrow
                          field="updatedAt"
                          currentField={filters.sortField}
                          direction={filters.sortDirection}
                        />
                      </button>
                    </th>
                    <th className="w-16 px-4 py-3 text-center font-medium text-subtle uppercase text-xs tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-default">
                  {products.map((product) => {
                    const cfg = statusConfig[product.status];
                    const isSelected = selectedIds.has(product.id);
                    const imageCount = product.images?.length || 1;
                    const variantCount = product.variantsCount || 0;

                    const thumbnailSrc =
                      (isValidImageUrl(product.thumbnail) && product.thumbnail) ||
                      (isValidImageUrl(product.image) && product.image) ||
                      (Array.isArray(product.images) && product.images.find((img) => isValidImageUrl(img))) ||
                      getCategoryDefaultImage(product.category, product.name);

                    return (
                      <tr
                        key={product.id}
                        className={`transition-colors hover:bg-muted/50 ${
                          isSelected ? "bg-primary-50/50" : ""
                        }`}
                      >
                        <td className="px-4 py-3">
                          <Checkbox
                            checked={isSelected}
                            onChange={() => toggleSelect(product.id)}
                            aria-label={`Select ${product.name}`}
                          />
                        </td>
                        <td className="px-2 py-3">
                          <div
                            onClick={() => setQuickViewProduct(product)}
                            className="h-10 w-10 rounded-lg bg-muted border border-default overflow-hidden flex-shrink-0 relative flex items-center justify-center cursor-pointer group hover:ring-2 hover:ring-primary-500/40 transition-all shadow-xs"
                            title={`Click to preview product & view all ${imageCount} photo(s)`}
                          >
                            <img
                              src={thumbnailSrc}
                              alt={product.name}
                              width={40}
                              height={40}
                              className="h-10 w-10 object-cover relative z-10 rounded-md"
                              loading="lazy"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  getCategoryDefaultImage(product.category, product.name);
                              }}
                            />
                            {imageCount > 1 && (
                              <span className="absolute bottom-0 right-0 z-20 px-1 py-0.2 rounded-tl-md text-[9px] font-extrabold bg-black/80 text-white">
                                +{imageCount - 1}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div
                            onClick={() => setQuickViewProduct(product)}
                            className="group cursor-pointer inline-flex flex-col"
                          >
                            <span className="font-semibold text-heading group-hover:text-primary-600 transition-colors flex items-center gap-1.5">
                              {product.name}
                              <span className="opacity-0 group-hover:opacity-100 text-xs text-primary-500 transition-opacity">
                                👁️ View
                              </span>
                            </span>
                            {variantCount > 0 && (
                              <span className="text-[11px] text-primary-600 font-medium mt-0.5 flex items-center gap-1">
                                <span>🔀</span> {variantCount} variant{variantCount > 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <code className="text-xs font-mono text-body bg-muted border border-default px-1.5 py-0.5 rounded">
                            {product.sku}
                          </code>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-heading tabular-nums">
                          {formatCurrency(product.price)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          <span
                            className={
                              product.stock === 0
                                ? "text-error-500 font-semibold"
                                : product.stock < 10
                                  ? "text-warning-600 font-medium"
                                  : "text-body"
                            }
                          >
                            {product.stock.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-body">
                          {product.category}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => toggleProductStatus(product.id)}
                            className="cursor-pointer transition-transform hover:scale-105 active:scale-95 text-left inline-flex items-center gap-1.5"
                            title={`Click to switch to ${product.status === "published" ? "Draft" : "Published"}`}
                          >
                            <Badge variant={cfg?.variant || "gray"} size="sm">
                              {cfg?.label || "Draft"}
                            </Badge>
                          </button>
                        </td>
                        <td className="px-4 py-3 text-body whitespace-nowrap">
                          {formatDate(product.updatedAt)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <ProductActions
                            product={product}
                            onQuickView={() => setQuickViewProduct(product)}
                            onToggleStatus={() => toggleProductStatus(product.id)}
                            onDuplicate={() => duplicateProduct(product.id)}
                            onDelete={() => handleSingleDelete(product)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {filteredCount > 0 && (
            <div className="px-4 py-4 border-t border-default">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredCount}
                pageSize={pageSize}
              />
            </div>
          )}
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmAction !== null}
        title={confirmAction?.title ?? ""}
        description={confirmAction?.description ?? ""}
        confirmLabel={confirmAction?.confirmLabel ?? "Confirm"}
        confirmVariant={confirmAction?.confirmVariant ?? "danger"}
        onConfirm={() => confirmAction?.onConfirm()}
        onCancel={() => setConfirmAction(null)}
      />

      {/* Product Quick View & Multi-Image Gallery Showcase Modal */}
      <ProductQuickViewModal
        product={quickViewProduct}
        open={quickViewProduct !== null}
        onClose={() => setQuickViewProduct(null)}
        onDuplicate={(id) => duplicateProduct(id)}
      />
    </div>
  );
}

function ProductActions({
  product,
  onQuickView,
  onToggleStatus,
  onDuplicate,
  onDelete,
}: {
  product: Product;
  onQuickView: () => void;
  onToggleStatus: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-subtle hover:text-heading hover:bg-muted transition-colors"
        aria-label={`Actions for ${product.name}`}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="8" cy="3" r="1.5" fill="currentColor" />
          <circle cx="8" cy="8" r="1.5" fill="currentColor" />
          <circle cx="8" cy="13" r="1.5" fill="currentColor" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-dropdown w-48 bg-card rounded-lg border border-default shadow-float overflow-hidden py-1">
            <button
              onClick={() => {
                setOpen(false);
                onQuickView();
              }}
              className="w-full text-left px-3 py-2 text-sm text-body hover:bg-muted hover:text-heading transition-colors flex items-center gap-2 font-medium"
            >
              <span>👁️</span> Quick View
            </button>
            <button
              onClick={() => {
                setOpen(false);
                onToggleStatus();
              }}
              className="w-full text-left px-3 py-2 text-sm text-body hover:bg-muted hover:text-heading transition-colors flex items-center gap-2 font-medium"
            >
              <span>{product.status === "published" ? "⏸️" : "🚀"}</span>
              {product.status === "published" ? "Set as Draft" : "Publish Product"}
            </button>
            <button
              onClick={() => {
                setOpen(false);
                router.push(`/products/${product.id}/edit`);
              }}
              className="w-full text-left px-3 py-2 text-sm text-body hover:bg-muted hover:text-heading transition-colors flex items-center gap-2"
            >
              <span>✏️</span> Edit
            </button>
            <button
              onClick={() => {
                setOpen(false);
                onDuplicate();
              }}
              className="w-full text-left px-3 py-2 text-sm text-body hover:bg-muted hover:text-heading transition-colors flex items-center gap-2"
            >
              <span>📋</span> Duplicate
            </button>
            <div className="border-t border-default my-1" />
            <button
              onClick={() => {
                setOpen(false);
                onDelete();
              }}
              className="w-full text-left px-3 py-2 text-sm text-error-500 hover:bg-error-50 hover:text-error-600 transition-colors flex items-center gap-2"
            >
              <span>🗑️</span> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}
