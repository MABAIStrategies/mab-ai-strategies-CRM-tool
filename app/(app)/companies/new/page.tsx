import { CompanyForm } from "../components/company-form";

export default function NewCompanyPage() {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm uppercase tracking-[0.35em] text-mab-gold">New company</p>
        <h1 className="text-3xl font-semibold text-mab-navy">Create a strategic account</h1>
        <p className="mt-2 text-sm text-mab-slate">
          Build the core dossier so every outreach sequence is informed and elegantly personalized.
        </p>
      </header>
      <CompanyForm />
    </div>
  );
}
