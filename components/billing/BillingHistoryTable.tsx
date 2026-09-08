"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";
import { InvoiceItem } from "@/lib/settings";

interface Props {
  invoices: InvoiceItem[];
}

export function BillingHistoryTable({ invoices }: Props) {
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);

  return (
    <div className="p-6 rounded-2xl bg-card border border-default shadow-sm space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between border-b border-default pb-3">
        <div>
          <h3 className="text-base font-bold text-heading" style={{ fontFamily: "var(--font-display)" }}>
            Billing &amp; Payment History
          </h3>
          <p className="text-xs text-subtle mt-0.5">
            Download past tax invoices, receipt PDFs, and track wallet top-up records.
          </p>
        </div>
        <span className="px-2.5 py-1 rounded bg-muted text-subtle text-xs font-semibold">
          {invoices.length} Total Statements
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-body">
          <thead className="bg-muted uppercase font-bold text-subtle border-b border-default">
            <tr>
              <th className="py-3 px-4">Statement Date</th>
              <th className="py-3 px-4">Invoice No.</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Gateway Method</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Invoice PDF</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-default">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-page transition-colors">
                <td className="py-3.5 px-4 font-mono text-subtle">{inv.date}</td>
                <td className="py-3.5 px-4 font-bold text-heading font-mono">{inv.invoiceNumber}</td>
                <td className="py-3.5 px-4 font-medium text-heading">{inv.description}</td>
                <td className="py-3.5 px-4">{inv.paymentMethod}</td>
                <td className="py-3.5 px-4 font-bold font-mono text-heading">
                  ${inv.amount.toFixed(2)}
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                      inv.status === "Paid"
                        ? "bg-success-50 text-success-700 border-success-200"
                        : inv.status === "Pending"
                        ? "bg-warning-50 text-warning-700 border-warning-200"
                        : "bg-error-50 text-error-700 border-error-200"
                    }`}
                  >
                    ● {inv.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => setSelectedInvoice(inv)}
                    className="px-3 py-1.5 rounded-lg border border-default bg-card hover:bg-muted text-primary-600 font-bold transition-all cursor-pointer"
                  >
                    View PDF 📄
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PDF Invoice View Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-overlay backdrop-blur-sm animate-fadeIn">
          <div className="bg-card border border-default max-w-lg w-full rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-default pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-subtle">
                  Official Tax Statement
                </span>
                <h3 className="text-lg font-bold text-heading">{selectedInvoice.invoiceNumber}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="text-subtle hover:text-heading font-bold"
              >
                &times;
              </button>
            </div>

            <div className="p-4 rounded-xl bg-page border border-default space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-subtle">Vendor Name:</span>
                <span className="font-semibold text-heading">Apex Artisans</span>
              </div>
              <div className="flex justify-between">
                <span className="text-subtle">Statement Date:</span>
                <span className="font-mono">{selectedInvoice.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-subtle">Transaction Type:</span>
                <span className="font-medium">{selectedInvoice.description}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-subtle">Payment Channel:</span>
                <span className="font-medium">{selectedInvoice.paymentMethod}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-default text-sm">
                <span className="font-bold text-heading">Total Amount Paid:</span>
                <span className="font-bold font-mono text-primary-600">${selectedInvoice.amount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-success-700 font-semibold flex items-center gap-1.5">
                <Check size={14} className="text-success-600" />
                <span>Digitally signed by Altrivo Payments Inc.</span>
              </span>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="px-5 py-2.5 rounded-xl bg-primary-500 text-on-primary text-xs font-bold hover:bg-primary-600"
              >
                Download Statement PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
