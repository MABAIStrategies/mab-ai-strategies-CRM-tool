import { notFound } from "next/navigation";
import { prisma } from "../../../../../src/lib/db";
import { DealForm } from "../../components/deal-form";

export default async function EditDealPage({ params }: { params: { id: string } }) {
  const deal = await prisma.deal.findFirst({
    where: { id: params.id, deletedAt: null }
  });

  if (!deal) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm uppercase tracking-[0.35em] text-mab-gold">Edit deal</p>
        <h1 className="text-3xl font-semibold text-mab-navy">Refine your deal strategy</h1>
        <p className="mt-2 text-sm text-mab-slate">
          Keep pipeline intelligence sharp and on-brand for every stakeholder.
        </p>
      </header>
      <DealForm
        initialData={{
          id: deal.id,
          companyId: deal.companyId,
          primaryContactId: deal.primaryContactId ?? "",
          stage: deal.stage,
          value: deal.value ? String(deal.value) : "",
          probability: String(deal.probability),
          closeDate: deal.closeDate ? deal.closeDate.toISOString().slice(0, 10) : "",
          offerType: deal.offerType,
          objections: deal.objections ?? "",
          roiDrivers: deal.roiDrivers ?? "",
          nextStepDate: deal.nextStepDate ? deal.nextStepDate.toISOString().slice(0, 10) : "",
          momentumScore: String(deal.momentumScore)
        }}
      />
    </div>
  );
}
