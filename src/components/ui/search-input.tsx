"use client";

import { cn } from "../../lib/utils";

export function SearchInput({
  placeholder,
  value,
  onChange,
  onKeyDown,
  className,
  containerClassName
}: {
  placeholder?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
  containerClassName?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3 rounded-2xl border border-mab-gold/40 bg-white/70 px-4 py-3 shadow-sm", containerClassName)}>
      <span className="text-mab-gold">⌕</span>
      <input
        placeholder={placeholder}
        aria-label={placeholder ?? "Search"}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className={cn("w-full bg-transparent text-sm text-mab-ink outline-none", className)}
      />
      <span className="rounded-full border border-mab-gold/40 px-2 py-1 text-[10px] text-mab-slate">
        ⌘K
      </span>
    </div>
  );
}
