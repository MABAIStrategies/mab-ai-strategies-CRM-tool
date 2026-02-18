import { NextResponse } from "next/server";
import { prisma } from "../../../src/lib/db";
import { rateLimit } from "../../../src/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const rate = rateLimit("deals", 30, 60000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const stage = searchParams.get("stage");
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 50)));
  const skip = (page - 1) * limit;

  const where = {
    deletedAt: null,
    ...(companyId ? { companyId } : {}),
    ...(stage ? { stage: stage as never } : {})
  };

  const [deals, total] = await Promise.all([
    prisma.deal.findMany({
      where,
      include: {
        company: { select: { id: true, name: true } },
        primaryContact: { select: { id: true, name: true, email: true } },
        _count: { select: { activities: true, tasks: true, notes: true } }
      },
      orderBy: { momentumScore: "desc" },
      skip,
      take: limit
    }),
    prisma.deal.count({ where })
  ]);

  return NextResponse.json({ deals, total, page, limit });
}

export async function POST(request: Request) {
  const rate = rateLimit("deals", 20, 60000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const body = await request.json();
  if (!body.companyId) {
    return NextResponse.json({ error: "companyId is required." }, { status: 400 });
  }

  const deal = await prisma.deal.create({
    data: {
      companyId: body.companyId,
      primaryContactId: body.primaryContactId ?? null,
      title: body.title ?? null,
      stage: body.stage ?? "PROSPECT_IDENTIFIED",
      value: body.value ?? null,
      probability: body.probability ?? 0,
      closeDate: body.closeDate ? new Date(body.closeDate) : null,
      offerType: body.offerType ?? "OTHER",
      objections: body.objections ?? null,
      roiDrivers: body.roiDrivers ?? null,
      nextStepDate: body.nextStepDate ? new Date(body.nextStepDate) : null,
      momentumScore: body.momentumScore ?? 50
    },
    include: {
      company: { select: { id: true, name: true } },
      primaryContact: { select: { id: true, name: true } }
    }
  });

  return NextResponse.json({ deal }, { status: 201 });
}
