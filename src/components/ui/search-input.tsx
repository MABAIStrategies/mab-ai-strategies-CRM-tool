"use client";

export function SearchInput({
  placeholder,
  value,
  onChange,
  onKeyDown
}: {
  placeholder?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-mab-gold/40 bg-white/70 px-4 py-3 shadow-sm">
      <span className="text-mab-gold">⌕</span>
      <input
        placeholder={placeholder}
        aria-label={placeholder ?? "Search"}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className="w-full bg-transparent text-sm text-mab-ink outline-none"
      />
      <span className="rounded-full border border-mab-gold/40 px-2 py-1 text-[10px] text-mab-slate">
        ⌘K
      </span>
    </div>
  );
}
