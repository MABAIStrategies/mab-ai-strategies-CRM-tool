import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="text-xs uppercase tracking-[0.35em] text-mab-gold">Not Found</p>
      <h1 className="text-3xl font-semibold text-mab-navy">This workspace isn’t here.</h1>
      <p className="text-sm text-mab-slate">Use the navigation to return to Today.</p>
      <Link
        href="/today"
        className="rounded-full border border-mab-navy/30 px-5 py-2 text-sm font-medium text-mab-navy"
      >
        Back to Today
      </Link>
    </div>
  );
}
