"use client";

import clsx from "clsx";
import Link from "next/link";

export function PrimaryButton({
  label,
  variant = "solid",
  onClick,
  href,
  ariaLabel,
  disabled = false,
  type = "button"
}: {
  label: string;
  variant?: "solid" | "outline";
  onClick?: () => void;
  href?: string;
  ariaLabel?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
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
      <Link href={href} className={className} aria-label={ariaLabel ?? label}>
        {label}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={className}
      aria-label={ariaLabel ?? label}
      disabled={disabled}
    >
      {label}
    </button>
  );
}
