"use client";

import { useState } from "react";

import {
  Button,
  Card,
  Badge,
  StatusPill,
  KPICard,
  Skeleton,
  EmptyState,
} from "@/components/shared";

function Panel({ theme }: { theme: "vendor" | "admin" }) {
  return (
    <div
      data-theme={theme === "admin" ? "admin" : undefined}
      className="flex-1 min-w-[380px] rounded-2xl bg-page p-6"
    >
      <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-subtle">
        {theme}
      </p>

      <div className="grid grid-cols-2 gap-4">
        <KPICard label="Revenue" value="$48.2k" sub="vs last month" trend="up" />
        <KPICard label="Refund rate" value="1.2%" sub="vs last month" trend="down" />
      </div>

      <Card className="mt-4">
        <p className="text-sm font-semibold text-heading">Orders</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <StatusPill status="in-progress" />
          <StatusPill status="in-review" />
          <StatusPill status="done" />
          <StatusPill status="blocked" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="primary">Primary</Badge>
          <Badge variant="accent">Accent</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="error">Error</Badge>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button variant="primary" size="sm">Save</Button>
          <Button variant="accent" size="sm">Accent</Button>
          <Button variant="ghost" size="sm">Cancel</Button>
          <Button variant="danger" size="sm">Delete</Button>
          <Button variant="link" size="sm">Link</Button>
        </div>
      </Card>

      <Card variant="elevated" className="mt-4 space-y-2">
        <Skeleton height="0.875rem" width="60%" />
        <Skeleton height="0.875rem" width="90%" />
        <Skeleton height="0.875rem" width="75%" />
      </Card>

      <EmptyState
        className="mt-4"
        title="No products yet"
        description="Add your first product to start selling."
        action={{ label: "Add product", onClick: () => {} }}
      />
    </div>
  );
}

export default function DemoPage() {
  const [showBoth, setShowBoth] = useState(true);

  return (
    <main className="min-h-dvh bg-muted p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-heading">
            Shared component demo
          </h1>
          <Button variant="ghost" size="sm" onClick={() => setShowBoth((v) => !v)}>
            {showBoth ? "Show vendor only" : "Show both"}
          </Button>
        </div>

        <div className="flex flex-wrap gap-6">
          <Panel theme="vendor" />
          {showBoth && <Panel theme="admin" />}
        </div>
      </div>
    </main>
  );
}
