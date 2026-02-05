import { NextResponse } from "next/server";
import { prisma } from "../../../src/lib/db";
import { rateLimit } from "../../../src/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const rate = rateLimit("companies", 30, 60000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 20)));
  const skip = (page - 1) * limit;

  const where = {
    deletedAt: null,
    ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {})
  };

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      include: {
        _count: { select: { contacts: true, deals: true, activities: true } }
      },
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit
    }),
    prisma.company.count({ where })
  ]);

  return NextResponse.json({ companies, total, page, limit });
}

export async function POST(request: Request) {
  const rate = rateLimit("companies", 20, 60000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const body = await request.json();
  if (!body.name || typeof body.name !== "string") {
    return NextResponse.json({ error: "name is required." }, { status: 400 });
  }

  const company = await prisma.company.create({
    data: {
      name: body.name,
      domain: body.domain ?? null,
      industry: body.industry ?? null,
      region: body.region ?? null,
      icpTags: body.icpTags ?? [],
      riskFlags: body.riskFlags ?? [],
      notesSummary: body.notesSummary ?? null
    }
  });

  return NextResponse.json({ company }, { status: 201 });
}
