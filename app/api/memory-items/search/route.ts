import { NextResponse } from "next/server";
import { prisma } from "../../../../src/lib/db";
import { semanticMemorySearch } from "../../../../src/lib/memory";
import { rateLimit } from "../../../../src/lib/rate-limit";

export async function GET(request: Request) {
  const rate = rateLimit("memory-search", 50, 60000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim();

  if (query.length < 2) {
    return NextResponse.json({ error: "q must be at least 2 characters." }, { status: 400 });
  }

  const [semanticMatches, companies, contacts, deals] = await Promise.all([
    semanticMemorySearch(query),
    prisma.company.findMany({
      where: { deletedAt: null, name: { contains: query, mode: "insensitive" } },
      select: { id: true, name: true, industry: true },
      take: 5
    }),
    prisma.contact.findMany({
      where: { deletedAt: null, name: { contains: query, mode: "insensitive" } },
      select: { id: true, name: true, title: true, companyId: true },
      take: 5
    }),
    prisma.deal.findMany({
      where: { deletedAt: null, title: { contains: query, mode: "insensitive" } },
      select: { id: true, title: true, stage: true, companyId: true },
      take: 5
    })
  ]);

  return NextResponse.json({
    query,
    semanticMatches,
    keywordMatches: {
      companies,
      contacts,
      deals
    }
  });
}
