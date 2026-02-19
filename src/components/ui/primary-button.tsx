"use client";

import clsx from "clsx";
import type { Route } from "next";
import Link from "next/link";
import { useBrandingAssets } from "../use-branding-assets";

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
  const { assets } = useBrandingAssets();
  const className = clsx(
    "group relative inline-flex items-center justify-center overflow-hidden rounded-full px-5 py-2 text-sm font-medium transition",
    variant === "solid"
      ? "bg-mab-navy text-white shadow-glow hover:-translate-y-0.5"
      : "border border-mab-navy/30 text-mab-navy hover:bg-mab-navy hover:text-white",
    disabled && "cursor-not-allowed opacity-50"
  );

  const content = (
    <>
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition duration-700 group-hover:translate-x-full" />
      <span className="relative z-10 inline-flex items-center gap-2">
        <img
          src={assets.logo.mark.uri}
          alt=""
          aria-hidden="true"
          className="h-4 w-4"
        />
        {label}
      </span>
    </>
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
      type={type}
      onClick={onClick}
      className={className}
      aria-label={ariaLabel ?? label}
      disabled={disabled}
    >
      {content}
    </button>
  );
}
