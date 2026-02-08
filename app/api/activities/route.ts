import { NextResponse } from "next/server";
import { prisma } from "../../../src/lib/db";

export async function GET() {
  const activities = await prisma.activity.findMany({
    where: { deletedAt: null },
    orderBy: { occurredAt: "desc" },
    take: 8,
    include: { deal: true, contact: true }
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
