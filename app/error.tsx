"use client";

import { useEffect } from "react";
import { PrimaryButton } from "../src/components/ui/primary-button";

export default function GlobalError({
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
    <html lang="en">
      <body className="bg-mab-ivory">
        <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-6 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-mab-gold">System Alert</p>
          <h1 className="text-3xl font-semibold text-mab-navy">We hit a snag.</h1>
          <p className="text-sm text-mab-slate">
            The workspace encountered an issue. Reset the view or return to Today.
          </p>
          <div className="flex flex-wrap gap-3">
            <PrimaryButton label="Try again" onClick={reset} ariaLabel="Retry loading" />
            <PrimaryButton label="Go to Today" href="/today" variant="outline" ariaLabel="Go to Today" />
          </div>
        </div>
      </body>
    </html>
  );
}
