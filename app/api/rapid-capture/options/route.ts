import { NextResponse } from "next/server";
import { prisma } from "../../../../src/lib/db";

export async function GET() {
  const companies = await prisma.company.findMany({
    orderBy: { updatedAt: "desc" },
    take: 8,
    select: {
      id: true,
      name: true,
      domain: true
    }
  });

  const companyIds = companies.map((company) => company.id);

  const [deals, contacts] = await Promise.all([
    prisma.deal.findMany({
      where: companyIds.length ? { companyId: { in: companyIds } } : undefined,
      orderBy: { updatedAt: "desc" },
      take: 12,
      select: {
        id: true,
        companyId: true,
        stage: true,
        value: true
      }
    }),
    prisma.contact.findMany({
      where: companyIds.length ? { companyId: { in: companyIds } } : undefined,
      orderBy: { updatedAt: "desc" },
      take: 12,
      select: {
        id: true,
        companyId: true,
        name: true,
        title: true
      }
    })
  ]);

  return NextResponse.json({ companies, deals, contacts });
}
