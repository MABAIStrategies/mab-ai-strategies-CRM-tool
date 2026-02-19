import { ContactForm } from "../components/contact-form";

export default function NewContactPage({
  searchParams
}: {
  searchParams?: { companyId?: string }
}) {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm uppercase tracking-[0.35em] text-mab-gold">New contact</p>
        <h1 className="text-3xl font-semibold text-mab-navy">Capture a stakeholder profile</h1>
        <p className="mt-2 text-sm text-mab-slate">
          Every relationship touchpoint is tracked for a premium, high-trust experience.
        </p>
      </header>
      <ContactForm defaultCompanyId={searchParams?.companyId ?? ""} />
    </div>
  );
}
