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
  const rate = rateLimit("tasks", 20, 60000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const body = await request.json();
  if (!body.title || typeof body.title !== "string") {
    return NextResponse.json({ error: "title is required." }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: {
      title: body.title,
      description: body.description ?? null,
      companyId: body.companyId ?? null,
      dealId: body.dealId ?? null,
      contactId: body.contactId ?? null,
      dueAt: body.dueAt ? new Date(body.dueAt) : null,
      status: body.status ?? "TODO"
    }
  });

  return NextResponse.json({ task }, { status: 201 });
}
