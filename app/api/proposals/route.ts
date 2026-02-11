import { NextResponse } from "next/server";
import { prisma } from "../../../src/lib/db";
import { rateLimit } from "../../../src/lib/rate-limit";
import { getAIProvider } from "../../../src/lib/ai-provider";

export async function POST(request: Request) {
  const rate = rateLimit("proposals", 10, 60000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const body = await request.json();
  const dealId = body.dealId as string;

  if (!dealId) {
    return NextResponse.json({ error: "dealId is required." }, { status: 400 });
  }

  const deal = await prisma.deal.findFirst({
    where: { id: dealId, deletedAt: null },
    include: {
      company: true,
      primaryContact: true,
      notes: { where: { deletedAt: null }, orderBy: { createdAt: "desc" }, take: 5 }
    }
  });

  if (!deal) {
    return NextResponse.json({ error: "Deal not found." }, { status: 404 });
  }

  const painPoints: string[] = [];
  const roiDrivers: string[] = [];

  for (const note of deal.notes) {
    if (note.structuredExtract && typeof note.structuredExtract === "object") {
      const extract = note.structuredExtract as Record<string, unknown>;
      if (Array.isArray(extract.painPoints)) {
        painPoints.push(...(extract.painPoints as string[]));
      }
      if (Array.isArray(extract.roiHooks)) {
        roiDrivers.push(...(extract.roiHooks as string[]));
      }
    }
  }

  if (body.painPoints) painPoints.push(...body.painPoints);
  if (body.roiDrivers) roiDrivers.push(...body.roiDrivers);

  const finalPainPoints = [...new Set(painPoints)].slice(0, 10);
  const finalRoi = [...new Set(roiDrivers)].slice(0, 10);

  if (finalPainPoints.length === 0) {
    finalPainPoints.push("Process optimization", "Operational efficiency");
  }
  if (finalRoi.length === 0) {
    finalRoi.push("Cost reduction", "Time savings", "Improved accuracy");
  }

  const ai = getAIProvider();
  const proposalContent = await ai.generateProposal({
    companyName: deal.company.name,
    dealContext: `Stage: ${deal.stage}, Offer: ${deal.offerType}, Value: ${deal.value ?? "TBD"}`,
    offerType: deal.offerType,
    painPoints: finalPainPoints,
    roiDrivers: finalRoi
  });

  const asset = await prisma.asset.create({
    data: {
      type: "PROPOSAL",
      title: `Proposal — ${deal.company.name} — ${deal.offerType}`,
      description: `AI-generated proposal for ${deal.company.name}`,
      tags: ["proposal", "ai-generated", deal.offerType.toLowerCase()],
      version: "1.0",
      status: "DRAFT",
      storageUri: `inline://proposal-${deal.id}`
    }
  });

  await prisma.note.create({
    data: {
      companyId: deal.companyId,
      dealId: deal.id,
      rawText: proposalContent,
      tags: ["proposal", "ai-generated"],
      summary: `Proposal generated for ${deal.company.name}`
    }
  });

  return NextResponse.json({
    proposal: proposalContent,
    asset,
    deal: { id: deal.id, company: deal.company.name }
  });
}
