"use client";

import { useEffect } from "react";
import { Button } from "@/components/shared";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App-level error caught:", error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-muted p-6 text-center font-sans">
      <div className="w-full max-w-md space-y-5">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-danger-500 flex items-center justify-center text-white font-bold font-display text-2xl shadow-md">
          !
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-heading font-display">
          Something went wrong
        </h1>
        <p className="text-sm font-medium text-body">
          An unexpected error occurred while processing your request.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Button variant="primary" size="md" onClick={() => reset()} className="font-bold">
            Try Again
          </Button>
          <Button variant="ghost" size="md" onClick={() => window.location.href = "/"} className="font-bold border-strong">
            Go Home
          </Button>
        </div>
      </div>
    </main>
  );
}
