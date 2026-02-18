import Image from "next/image";

export default function BrandLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-11 w-11 overflow-hidden rounded-2xl border border-brand-gold/40 bg-brand-midnight shadow-glow">
        <Image
          src="/brand/logo.svg"
          alt="MAB AI Strategies logo"
          fill
          className="object-cover"
          priority
        />
      </div>
      <div>
        <p className="text-sm font-semibold text-brand-ivory">MAB AI Strategies</p>
        <p className="text-xs text-brand-ivory/60">Command Center</p>
      </div>
    </div>
  );
}
