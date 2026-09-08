import type { Metadata } from "next";
import "../styles/globals.css";
import { CartProvider } from "@/context/CartContext";
import { CustomerAuthProvider } from "@/context/CustomerAuthContext";
import { VendorStoreProvider } from "@/context/VendorStoreContext";
import { CartDrawer } from "@/components/cart/CartDrawer";

export const metadata: Metadata = {
  title: "Altrivo Vendor Platform",
  description: "Altrivo design system, vendor portal, and public customer storefront",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <VendorStoreProvider>
          <CustomerAuthProvider>
            <CartProvider>
              {children}
              <CartDrawer />
            </CartProvider>
          </CustomerAuthProvider>
        </VendorStoreProvider>
      </body>
    </html>
  );
}
