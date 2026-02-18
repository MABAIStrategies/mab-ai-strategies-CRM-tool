import { NextResponse } from "next/server";
import { prisma } from "../../../src/lib/db";
import { rateLimit } from "../../../src/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const rate = rateLimit("activities", 30, 60000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const dealId = searchParams.get("dealId");
  const contactId = searchParams.get("contactId");
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 30)));

  const where = {
    deletedAt: null,
    ...(companyId ? { companyId } : {}),
    ...(dealId ? { dealId } : {}),
    ...(contactId ? { contactId } : {})
  };

  const activities = await prisma.activity.findMany({
    where,
    include: {
      company: { select: { id: true, name: true } },
      contact: { select: { id: true, name: true } },
      deal: { select: { id: true, title: true, stage: true } }
    },
    orderBy: { occurredAt: "desc" },
    take: limit
  });

  return NextResponse.json({ activities });
}

export async function POST(request: Request) {
  const body = await request.json();
  const payload = Array.isArray(body.activities) ? body.activities : [body];

  const activities = await prisma.$transaction(
    payload.map((activity) =>
      prisma.activity.create({
        data: {
          companyId: activity.companyId ?? "demo-company",
          dealId: activity.dealId ?? null,
          contactId: activity.contactId ?? null,
          type: activity.type,
          occurredAt: new Date(activity.occurredAt),
          durationMinutes: activity.durationMinutes,
          outcome: activity.outcome
        }
      })
    )
  );

  return NextResponse.json({ activities });
}
