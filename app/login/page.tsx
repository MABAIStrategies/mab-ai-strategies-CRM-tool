"use client";

import { useState } from "react";
import { PrimaryButton } from "../../src/components/ui/primary-button";

export default function LoginPage() {
  const [passcode, setPasscode] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode })
      });
      if (!response.ok) {
        throw new Error("Invalid passcode.");
      }
      window.location.href = "/today";
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="text-xs uppercase tracking-[0.35em] text-mab-gold">Secure Access</p>
      <h1 className="text-3xl font-semibold text-mab-navy">MAB AI Strategies CRM</h1>
      <p className="text-sm text-mab-slate">Enter your passcode to continue.</p>
      <div className="w-full max-w-sm space-y-3">
        <input
          type="password"
          value={passcode}
          onChange={(event) => setPasscode(event.target.value)}
          placeholder="Passcode"
          aria-label="Passcode"
          className="w-full rounded-xl border border-mab-navy/10 bg-white px-4 py-3 text-sm text-mab-ink shadow-sm focus:border-mab-gold focus:outline-none"
        />
        {errorMessage ? (
          <p className="text-xs text-red-600" role="alert">
            {errorMessage}
          </p>
        ) : null}
        <PrimaryButton
          label={loading ? "Signing in..." : "Enter Workspace"}
          onClick={handleLogin}
          ariaLabel="Sign in"
        />
      </div>
    </div>
  );
}
