"use client";

interface WhatsAppWidgetProps {
  vendorName: string;
  vendorPhone: string;
  productTitle: string;
  variantName?: string;
  price?: number;
}

export function WhatsAppWidget({
  vendorName,
  vendorPhone,
  productTitle,
  variantName,
  price,
}: WhatsAppWidgetProps) {
  const handleOpenWhatsApp = () => {
    const cleanPhone = vendorPhone.replace(/[^0-9]/g, "");
    const msg = encodeURIComponent(
      `Hi ${vendorName}, I am viewing "${productTitle}"${
        variantName ? ` (${variantName})` : ""
      }${price ? ` listed at $${price.toFixed(2)}` : ""} on Altrio and have a question before placing my order.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, "_blank");
  };

  return (
    <button
      onClick={handleOpenWhatsApp}
      className="w-full flex items-center justify-center gap-2 rounded-2xl border border-success-200 bg-success-50 px-4 py-3 text-xs font-extrabold text-success-700 hover:bg-success-100 transition-all shadow-xs"
      title="Ask questions directly to the artist or vendor on WhatsApp"
    >
      <span className="text-base">💬</span>
      <span>Chat with {vendorName} directly on WhatsApp</span>
    </button>
  );
}
