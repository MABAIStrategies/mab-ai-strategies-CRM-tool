import { NextResponse } from "next/server";
import { prisma } from "../../../../src/lib/db";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const deal = await prisma.deal.findFirst({
    where: { id: params.id, deletedAt: null },
    include: {
      company: true,
      primaryContact: true,
      activities: {
        where: { deletedAt: null },
        include: { contact: true },
        orderBy: { occurredAt: "desc" },
        take: 30
      },
      notes: { where: { deletedAt: null }, orderBy: { createdAt: "desc" }, take: 10 },
      tasks: { where: { deletedAt: null }, orderBy: { createdAt: "desc" } }
    }
  });

  if (!deal) {
    return NextResponse.json({ error: "Deal not found." }, { status: 404 });
  }

  return NextResponse.json({ deal });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();

  const deal = await prisma.deal.update({
    where: { id: params.id },
    data: {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.stage !== undefined ? { stage: body.stage } : {}),
      ...(body.value !== undefined ? { value: body.value } : {}),
      ...(body.probability !== undefined ? { probability: body.probability } : {}),
      ...(body.closeDate !== undefined
        ? { closeDate: body.closeDate ? new Date(body.closeDate) : null }
        : {}),
      ...(body.offerType !== undefined ? { offerType: body.offerType } : {}),
      ...(body.objections !== undefined ? { objections: body.objections } : {}),
      ...(body.roiDrivers !== undefined ? { roiDrivers: body.roiDrivers } : {}),
      ...(body.nextStepDate !== undefined
        ? { nextStepDate: body.nextStepDate ? new Date(body.nextStepDate) : null }
        : {}),
      ...(body.momentumScore !== undefined ? { momentumScore: body.momentumScore } : {}),
      ...(body.primaryContactId !== undefined
        ? { primaryContactId: body.primaryContactId }
        : {})
    },
    include: {
      company: { select: { id: true, name: true } },
      primaryContact: { select: { id: true, name: true } }
    }
  });

  return NextResponse.json({ deal });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  await prisma.deal.update({
    where: { id: params.id },
    data: { deletedAt: new Date() }
  });

  return NextResponse.json({ ok: true });
}
