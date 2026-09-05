import Link from "next/link";
import { Button, Card } from "@/components/shared";

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-muted p-6 font-sans">
      <div className="w-full max-w-lg space-y-6 text-center">
        <div className="space-y-2">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-primary-500 flex items-center justify-center text-on-primary font-bold font-display text-2xl shadow-md">
            A
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-heading font-display">
            Altrivo Unified Portal
          </h1>
          <p className="text-sm font-medium text-body">
            Design system, vendor onboarding, dashboard, analytics, and public storefront.
          </p>
        </div>

        <Card className="p-6 space-y-6 text-left shadow-lg border-default">
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-primary-600 mb-3">
              🛍️ Storefront & Customer Experience
            </h2>
            <div className="space-y-2">
              <Link href="/products/p-101" className="block">
                <Button variant="accent" size="md" className="w-full justify-between font-extrabold">
                  <span>Public Customer Product Page (PDP)</span>
                  <span>→</span>
                </Button>
              </Link>
            </div>
          </div>

          <hr className="border-default" />

          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-primary-600 mb-3">
              📊 Vendor Management & Operations
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Link href="/dashboard" className="block">
                <Button variant="primary" size="md" className="w-full justify-between font-bold text-xs">
                  <span>Dashboard (Analytics)</span>
                  <span>→</span>
                </Button>
              </Link>

              <Link href="/orders" className="block">
                <Button variant="primary" size="md" className="w-full justify-between font-bold text-xs">
                  <span>Orders Management</span>
                  <span>→</span>
                </Button>
              </Link>

              <Link href="/inventory" className="block">
                <Button variant="primary" size="md" className="w-full justify-between font-bold text-xs">
                  <span>Inventory Catalog</span>
                  <span>→</span>
                </Button>
              </Link>

              <Link href="/products" className="block">
                <Button variant="primary" size="md" className="w-full justify-between font-bold text-xs">
                  <span>Products Catalog</span>
                  <span>→</span>
                </Button>
              </Link>

              <Link href="/onboarding" className="block">
                <Button variant="ghost" size="md" className="w-full justify-between font-bold text-xs border border-default">
                  <span>Onboarding Wizard</span>
                  <span>→</span>
                </Button>
              </Link>

              <Link href="/settings" className="block">
                <Button variant="ghost" size="md" className="w-full justify-between font-bold text-xs border border-default">
                  <span>Business Settings</span>
                  <span>→</span>
                </Button>
              </Link>

              <Link href="/billing" className="block">
                <Button variant="ghost" size="md" className="w-full justify-between font-bold text-xs border border-default">
                  <span>Wallet & Billing</span>
                  <span>→</span>
                </Button>
              </Link>

              <Link href="/demo" className="block">
                <Button variant="ghost" size="md" className="w-full justify-between font-bold text-xs border border-default">
                  <span>UI System Demo</span>
                  <span>→</span>
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
