import { NextResponse } from "next/server";
import { prisma } from "../../../src/lib/db";
import { rateLimit } from "../../../src/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const rate = rateLimit("tasks", 30, 60000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const dealId = searchParams.get("dealId");
  const status = searchParams.get("status");

  const where = {
    deletedAt: null,
    ...(companyId ? { companyId } : {}),
    ...(dealId ? { dealId } : {}),
    ...(status ? { status: status as never } : {})
  };

  const tasks = await prisma.task.findMany({
    where,
    include: {
      company: { select: { id: true, name: true } },
      deal: { select: { id: true, title: true } },
      contact: { select: { id: true, name: true } }
    },
    orderBy: [{ status: "asc" }, { dueAt: "asc" }, { createdAt: "desc" }]
  });

  return NextResponse.json({ tasks });
}

export async function POST(request: Request) {
  const body = await request.json();
  const payload = Array.isArray(body.tasks) ? body.tasks : [body];

  const tasks = await prisma.$transaction(
    payload.map((task) =>
      prisma.task.create({
        data: {
          companyId: task.companyId ?? "demo-company",
          dealId: task.dealId ?? null,
          contactId: task.contactId ?? null,
          title: task.title,
          description: task.description,
          dueAt: task.dueAt ? new Date(task.dueAt) : null,
          status: task.status ?? "TODO"
        }
      })
    )
  );

  return NextResponse.json({ tasks });
}
