import { NextResponse } from "next/server";
import { prisma } from "../../../src/lib/db";
import { rateLimit } from "../../../src/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const rate = rateLimit("contacts", 30, 60000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const companyId = searchParams.get("companyId");
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 20)));
  const skip = (page - 1) * limit;

  const where = {
    deletedAt: null,
    ...(companyId ? { companyId } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } }
          ]
        }
      : {})
  };

  const [contacts, total] = await Promise.all([
    prisma.contact.findMany({
      where,
      include: { company: { select: { id: true, name: true } } },
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit
    }),
    prisma.contact.count({ where })
  ]);

  return NextResponse.json({ contacts, total, page, limit });
}

export async function POST(request: Request) {
  const rate = rateLimit("contacts", 20, 60000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const body = await request.json();
  if (!body.name || typeof body.name !== "string") {
    return NextResponse.json({ error: "name is required." }, { status: 400 });
  }
  if (!body.companyId || typeof body.companyId !== "string") {
    return NextResponse.json({ error: "companyId is required." }, { status: 400 });
  }

  const contact = await prisma.contact.create({
    data: {
      companyId: body.companyId,
      name: body.name,
      title: body.title ?? null,
      email: body.email ?? null,
      phone: body.phone ?? null,
      linkedinUrl: body.linkedinUrl ?? null,
      source: body.source ?? null,
      relationshipStrength: body.relationshipStrength ?? 50
    },
    include: { company: { select: { id: true, name: true } } }
  });

  return NextResponse.json({ contact }, { status: 201 });
}
