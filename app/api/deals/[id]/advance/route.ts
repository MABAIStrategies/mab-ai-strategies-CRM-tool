import { NextResponse } from "next/server";
import { prisma } from "../../../../../src/lib/db";

const STAGE_ORDER = [
  "PROSPECT_IDENTIFIED",
  "ENRICHED",
  "OUTREACH_SENT",
  "DISCOVERY_SCHEDULED",
  "DISCOVERY_COMPLETED",
  "OFFER_PRESENTED",
  "PROPOSAL_SENT",
  "CLOSED_WON"
] as const;

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const deal = await prisma.deal.findFirst({
    where: { id: params.id, deletedAt: null }
  });

  if (!deal) {
    return NextResponse.json({ error: "Deal not found." }, { status: 404 });
  }

  let nextStage = body.stage;
  if (!nextStage) {
    const currentIdx = STAGE_ORDER.indexOf(deal.stage as (typeof STAGE_ORDER)[number]);
    if (currentIdx >= 0 && currentIdx < STAGE_ORDER.length - 1) {
      nextStage = STAGE_ORDER[currentIdx + 1];
    } else {
      return NextResponse.json({ error: "Deal is already at final stage." }, { status: 400 });
    }
  }

  const newMomentum = Math.min(100, deal.momentumScore + 5);
  const newProbability = Math.min(100, deal.probability + 8);

  const updated = await prisma.deal.update({
    where: { id: params.id },
    data: {
      stage: nextStage,
      momentumScore: newMomentum,
      probability: newProbability
    },
    include: {
      company: { select: { id: true, name: true } },
      primaryContact: { select: { id: true, name: true } }
    }
  });

  await prisma.activity.create({
    data: {
      companyId: deal.companyId,
      dealId: deal.id,
      type: "OTHER",
      occurredAt: new Date(),
      outcome: `Deal advanced from ${deal.stage} to ${nextStage}`
    }
  });

  return NextResponse.json({ deal: updated });
}
