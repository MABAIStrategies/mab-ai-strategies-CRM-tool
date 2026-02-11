import { NextResponse } from "next/server";
import { prisma } from "../../../../src/lib/db";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const contact = await prisma.contact.findFirst({
    where: { id: params.id, deletedAt: null },
    include: {
      company: true,
      deals: { where: { deletedAt: null } },
      activities: { where: { deletedAt: null }, orderBy: { occurredAt: "desc" }, take: 20 },
      notes: { where: { deletedAt: null }, orderBy: { createdAt: "desc" }, take: 10 },
      outreachLogs: { where: { deletedAt: null }, orderBy: { createdAt: "desc" }, take: 10 }
    }
  });

  if (!contact) {
    return NextResponse.json({ error: "Contact not found." }, { status: 404 });
  }

  return NextResponse.json({ contact });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();

  const contact = await prisma.contact.update({
    where: { id: params.id },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.email !== undefined ? { email: body.email } : {}),
      ...(body.phone !== undefined ? { phone: body.phone } : {}),
      ...(body.linkedinUrl !== undefined ? { linkedinUrl: body.linkedinUrl } : {}),
      ...(body.relationshipStrength !== undefined
        ? { relationshipStrength: body.relationshipStrength }
        : {}),
      ...(body.source !== undefined ? { source: body.source } : {})
    }
  });

  return NextResponse.json({ contact });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  await prisma.contact.update({
    where: { id: params.id },
    data: { deletedAt: new Date() }
  });

  return NextResponse.json({ ok: true });
}
