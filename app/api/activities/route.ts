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
  const rate = rateLimit("activities", 20, 60000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const body = await request.json();
  if (!body.companyId) {
    return NextResponse.json({ error: "companyId is required." }, { status: 400 });
  }
  if (!body.type) {
    return NextResponse.json({ error: "type is required." }, { status: 400 });
  }

  const activity = await prisma.activity.create({
    data: {
      companyId: body.companyId,
      dealId: body.dealId ?? null,
      contactId: body.contactId ?? null,
      type: body.type,
      occurredAt: body.occurredAt ? new Date(body.occurredAt) : new Date(),
      durationMinutes: body.durationMinutes ?? null,
      outcome: body.outcome ?? null
    },
    include: {
      company: { select: { id: true, name: true } },
      contact: { select: { id: true, name: true } }
    }
  });

  return NextResponse.json({ activity }, { status: 201 });
}
