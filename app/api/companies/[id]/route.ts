import { NextResponse } from "next/server";
import { prisma } from "../../../../src/lib/db";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const company = await prisma.company.findFirst({
    where: { id: params.id, deletedAt: null },
    include: {
      contacts: { where: { deletedAt: null }, orderBy: { createdAt: "desc" } },
      deals: {
        where: { deletedAt: null },
        include: { primaryContact: true },
        orderBy: { updatedAt: "desc" }
      },
      activities: {
        where: { deletedAt: null },
        include: { contact: true, deal: true },
        orderBy: { occurredAt: "desc" },
        take: 20
      },
      notes: { where: { deletedAt: null }, orderBy: { createdAt: "desc" }, take: 10 },
      tasks: { where: { deletedAt: null }, orderBy: { createdAt: "desc" } },
      outreachLogs: { where: { deletedAt: null }, orderBy: { createdAt: "desc" }, take: 20 }
    }
  });

  if (!company) {
    return NextResponse.json({ error: "Company not found." }, { status: 404 });
  }

  return NextResponse.json({ company });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();

  const company = await prisma.company.update({
    where: { id: params.id },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.domain !== undefined ? { domain: body.domain } : {}),
      ...(body.industry !== undefined ? { industry: body.industry } : {}),
      ...(body.region !== undefined ? { region: body.region } : {}),
      ...(body.icpTags !== undefined ? { icpTags: body.icpTags } : {}),
      ...(body.riskFlags !== undefined ? { riskFlags: body.riskFlags } : {}),
      ...(body.notesSummary !== undefined ? { notesSummary: body.notesSummary } : {}),
      ...(body.enrichedData !== undefined ? { enrichedData: body.enrichedData } : {})
    }
  });

  return NextResponse.json({ company });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  await prisma.company.update({
    where: { id: params.id },
    data: { deletedAt: new Date() }
  });

  return NextResponse.json({ ok: true });
}
