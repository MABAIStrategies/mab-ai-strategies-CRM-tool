import { DealForm } from "../components/deal-form";

export default function NewDealPage({
  searchParams
}: {
  searchParams?: { companyId?: string; primaryContactId?: string }
}) {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm uppercase tracking-[0.35em] text-mab-gold">New deal</p>
        <h1 className="text-3xl font-semibold text-mab-navy">Launch a new pipeline opportunity</h1>
        <p className="mt-2 text-sm text-mab-slate">
          Capture the offer, timeline, and ROI drivers so every step feels premium and confident.
        </p>
      </header>
      <DealForm
        defaultCompanyId={searchParams?.companyId ?? ""}
        defaultPrimaryContactId={searchParams?.primaryContactId ?? ""}
      />
    </div>
  );
}
