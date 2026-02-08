import { notFound } from "next/navigation";
import { prisma } from "../../../../../src/lib/db";
import { CompanyForm } from "../../components/company-form";

export default async function EditCompanyPage({ params }: { params: { id: string } }) {
  const company = await prisma.company.findFirst({
    where: { id: params.id, deletedAt: null }
  });

  if (!company) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm uppercase tracking-[0.35em] text-mab-gold">Edit company</p>
        <h1 className="text-3xl font-semibold text-mab-navy">Refine account intelligence</h1>
        <p className="mt-2 text-sm text-mab-slate">
          Keep the profile current so AI sequences always align to MAB standards.
        </p>
      </header>
      <CompanyForm
        initialData={{
          id: company.id,
          name: company.name,
          domain: company.domain ?? "",
          industry: company.industry ?? "",
          region: company.region ?? "",
          icpTags: company.icpTags.join(", "),
          riskFlags: company.riskFlags.join(", "),
          notesSummary: company.notesSummary ?? ""
        }}
      />
    </div>
  );
}
