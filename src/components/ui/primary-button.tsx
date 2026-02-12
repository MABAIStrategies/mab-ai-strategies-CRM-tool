"use client";

import clsx from "clsx";
import type { Route } from "next";
import Link from "next/link";

export function PrimaryButton({
  label,
  variant = "solid",
  onClick,
  href,
  ariaLabel,
  disabled = false
}: {
  label: string;
  variant?: "solid" | "outline";
  onClick?: () => void;
  href?: string;
  ariaLabel?: string;
  disabled?: boolean;
}) {
  const className = clsx(
    "inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-medium transition",
    variant === "solid"
      ? "bg-mab-navy text-white shadow-glow hover:-translate-y-0.5"
      : "border border-mab-navy/30 text-mab-navy hover:bg-mab-navy hover:text-white",
    disabled && "cursor-not-allowed opacity-50"
  );

  if (href) {
    return (
      <Link href={href as Route} className={className} aria-label={ariaLabel ?? label}>
        {label}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={className}
      aria-label={ariaLabel ?? label}
      disabled={disabled}
    >
      {label}
    </button>
  );
}
