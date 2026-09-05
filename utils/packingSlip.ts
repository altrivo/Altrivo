import { Order } from "@/types/orders";

/**
 * Generates an official printable Packing Slip document in a popup window
 * and triggers window.print() automatically.
 */
export function printPackingSlip(order: Order) {
  const printWindow = window.open("", "_blank", "width=800,height=900");
  if (!printWindow) {
    alert("Please allow pop-up windows to print the packing slip.");
    return;
  }

  const itemsHtml = order.items
    .map(
      (item, idx) => `
    <tr style="border-bottom: 1px solid var(--border-default, #e5e5e5);">
      <td style="padding: 12px; font-weight: bold; font-family: monospace;">${idx + 1}</td>
      <td style="padding: 12px;">
        <div style="font-weight: bold; font-size: 14px;">${item.name}</div>
        <div style="font-size: 11px; color: var(--text-muted, #737373);">SKU: ${item.sku || "N/A"}</div>
      </td>
      <td style="padding: 12px; text-align: center; font-weight: bold; font-size: 14px;">${item.quantity}</td>
      <td style="padding: 12px; text-align: right; font-family: monospace;">$${item.price.toFixed(2)}</td>
      <td style="padding: 12px; text-align: right; font-weight: bold; font-family: monospace;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `
    )
    .join("");

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Packing Slip - ${order.orderNumber}</title>
      <style>
        @media print {
          body { -webkit-print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
        body {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: var(--text-heading, #171717);
          background: #ffffff;
          margin: 0;
          padding: 40px;
          line-height: 1.5;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 3px solid var(--primary-500, #694873);
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .vendor-brand {
          font-size: 24px;
          font-weight: 800;
          color: var(--primary-700, #4A3252);
          text-transform: uppercase;
          letter-spacing: -0.5px;
        }
        .doc-title {
          font-size: 28px;
          font-weight: 800;
          color: var(--text-heading, #171717);
          text-align: right;
        }
        .meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }
        .box {
          border: 1px solid var(--border-default, #e5e5e5);
          border-radius: 8px;
          padding: 16px;
          background: var(--bg-card-tint, rgba(105,72,115,0.02));
        }
        .box-title {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--text-muted, #737373);
          margin-bottom: 8px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        th {
          background: var(--neutral-100, #f5f5f5);
          text-align: left;
          padding: 12px;
          font-size: 11px;
          text-transform: uppercase;
          font-weight: 800;
          border-bottom: 2px solid var(--border-default, #e5e5e5);
        }
        .footer {
          margin-top: 40px;
          border-top: 1px solid var(--border-default, #e5e5e5);
          padding-top: 20px;
          font-size: 12px;
          color: var(--text-muted, #737373);
          text-align: center;
        }
        .barcode {
          font-family: monospace;
          font-size: 18px;
          font-weight: bold;
          letter-spacing: 4px;
          background: #f0f0f0;
          padding: 8px 16px;
          display: inline-block;
          border-radius: 4px;
          margin-top: 6px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="vendor-brand">Tahleel Studio</div>
          <div style="font-size: 12px; color: var(--text-muted, #737373); margin-top: 4px;">
            Art & Craft Vendor Partner · Altrio Platform
          </div>
        </div>
        <div style="text-align: right;">
          <div class="doc-title">PACKING SLIP</div>
          <div style="font-size: 14px; font-weight: bold; font-family: monospace; margin-top: 4px;">
            Order ${order.orderNumber}
          </div>
          <div style="font-size: 12px; color: var(--text-muted, #737373);">
            Date: ${new Date(order.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      <div class="meta-grid">
        <div class="box">
          <div class="box-title">Ship To Customer</div>
          <div style="font-weight: 800; font-size: 16px;">${order.customerName}</div>
          <div style="font-size: 13px; margin-top: 4px; font-weight: 500;">${order.shippingAddress}</div>
          <div style="font-size: 12px; color: var(--text-muted, #737373); margin-top: 6px;">
            Email: ${order.customerEmail} | Phone: ${order.customerPhone || "N/A"}
          </div>
        </div>

        <div class="box">
          <div class="box-title">Fulfillment Details</div>
          <div style="font-size: 13px;"><strong>Delivery Method:</strong> ${order.deliveryMethod.toUpperCase()}</div>
          <div style="font-size: 13px; margin-top: 4px;"><strong>Carrier:</strong> ${order.carrier || "FedEx Express"}</div>
          <div style="font-size: 13px; margin-top: 4px;"><strong>Tracking #:</strong> ${order.trackingNumber || "TRK-PENDING"}</div>
          <div class="barcode">||||| | |||| ||| ||||||| |</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 40px;">#</th>
            <th>Item Description</th>
            <th style="text-align: center; width: 60px;">Qty</th>
            <th style="text-align: right; width: 100px;">Unit Price</th>
            <th style="text-align: right; width: 110px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      ${
        order.notes
          ? `<div class="box" style="margin-bottom: 30px; background: #fffbe0; border-color: #f59e0b;">
              <div class="box-title" style="color: #b45309;">Special Handling Notes</div>
              <div style="font-size: 13px; font-weight: 600;">${order.notes}</div>
            </div>`
          : ""
      }

      <div class="footer">
        Thank you for your order with Tahleel Studio via Altrio Vendor Network.
        <br>For support or returns, please contact vendor@altrio.com.
      </div>

      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
