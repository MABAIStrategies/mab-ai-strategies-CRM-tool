"use client";

export function Textarea({
  placeholder,
  value,
  onChange
}: {
  placeholder?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) {
  return (
    <textarea
      placeholder={placeholder}
      aria-label={placeholder ?? "Notes"}
      value={value}
      onChange={onChange}
      className="min-h-[140px] w-full rounded-xl border border-mab-navy/10 bg-white px-4 py-3 text-sm text-mab-ink shadow-sm focus:border-mab-gold focus:outline-none"
    />
  );
}
