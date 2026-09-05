import { Order } from "@/types/orders";

/**
 * Format a string value for safe inclusion in a CSV file.
 */
function escapeCSVField(field: string | number | undefined | null): string {
  if (field === undefined || field === null) return '""';
  const str = String(field);
  // If field contains quotes, commas, or newlines, wrap in quotes and double internal quotes
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Exports an array of Order objects to a downloadable CSV file.
 */
export function exportOrdersToCSV(orders: Order[], filenamePrefix = "vendor_orders") {
  if (!orders || orders.length === 0) {
    alert("No orders available to export.");
    return;
  }

  const headers = [
    "Order #",
    "Customer Name",
    "Customer Email",
    "Customer Phone",
    "Total Amount ($)",
    "Payment Status",
    "Payment Method",
    "Delivery Status",
    "Delivery Method",
    "Date & Time",
    "Shipping Address",
    "Items Count",
  ];

  const rows = orders.map((order) => [
    order.orderNumber,
    order.customerName,
    order.customerEmail,
    order.customerPhone || "N/A",
    order.totalAmount.toFixed(2),
    order.paymentStatus,
    order.paymentMethod,
    order.deliveryStatus,
    order.deliveryMethod,
    new Date(order.createdAt).toLocaleString(),
    order.shippingAddress,
    order.items?.length || 0,
  ]);

  const csvContent = [
    headers.map(escapeCSVField).join(","),
    ...rows.map((row) => row.map(escapeCSVField).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  const dateStr = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.setAttribute("download", `${filenamePrefix}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
