import { NextResponse } from "next/server";
import { prisma } from "../../../src/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId") ?? undefined;
  const dealId = searchParams.get("dealId") ?? undefined;
  const contactId = searchParams.get("contactId") ?? undefined;
  const limit = Number(searchParams.get("limit") ?? "5");

  const tasks = await prisma.task.findMany({
    where: {
      companyId,
      dealId,
      contactId,
      status: { not: "DONE" }
    },
    orderBy: { createdAt: "desc" },
    take: Number.isNaN(limit) ? 5 : Math.min(limit, 10),
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      dueAt: true
    }
  });

  return NextResponse.json({ tasks });
}
