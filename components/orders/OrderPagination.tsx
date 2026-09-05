"use client";

import { Button } from "@/components/shared";

interface OrderPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function OrderPagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: OrderPaginationProps) {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers
  const pages: (number | string)[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-default bg-card p-4 shadow-card">
      {/* Items count & Per Page Selector */}
      <div className="flex items-center gap-4">
        <span className="text-xs font-semibold text-body">
          Showing <strong className="text-heading font-extrabold text-sm">{startItem}</strong> to{" "}
          <strong className="text-heading font-extrabold text-sm">{endItem}</strong> of{" "}
          <strong className="text-heading font-extrabold text-sm">{totalItems}</strong> orders
        </span>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-heading">Per page:</label>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded-lg border border-default bg-input px-2.5 py-1.5 text-xs font-bold text-heading focus:border-focus focus:outline-none shadow-xs"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Pagination Navigation */}
      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-3 py-1.5 text-xs font-extrabold border-strong"
        >
          Previous
        </Button>

        {pages.map((p, idx) =>
          typeof p === "number" ? (
            <button
              key={idx}
              onClick={() => onPageChange(p)}
              className={`min-w-[34px] h-8 rounded-lg text-xs font-extrabold transition-colors ${
                p === currentPage
                  ? "bg-primary-500 text-on-primary shadow-xs"
                  : "text-heading hover:bg-neutral-200 border border-default"
              }`}
            >
              {p}
            </button>
          ) : (
            <span key={idx} className="px-1.5 text-xs font-bold text-heading">
              {p}
            </span>
          )
        )}

        <Button
          variant="ghost"
          size="sm"
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-3 py-1.5 text-xs font-extrabold border-strong"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
