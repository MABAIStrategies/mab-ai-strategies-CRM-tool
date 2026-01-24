"use client";

import { useEffect } from "react";
import { PrimaryButton } from "../../src/components/ui/primary-button";

export default function AppError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="text-xs uppercase tracking-[0.35em] text-mab-gold">System Alert</p>
      <h1 className="text-3xl font-semibold text-mab-navy">The workspace paused.</h1>
      <p className="text-sm text-mab-slate">
        Refresh the module or return to Today to continue.
      </p>
      <div className="flex flex-wrap gap-3">
        <PrimaryButton label="Retry" onClick={reset} ariaLabel="Retry loading" />
        <PrimaryButton label="Go to Today" href="/today" variant="outline" ariaLabel="Go to Today" />
      </div>
    </div>
  );
}
