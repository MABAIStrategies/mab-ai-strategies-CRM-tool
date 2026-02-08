import { NextResponse } from "next/server";
import { prisma } from "../../../src/lib/db";

export async function GET() {
  const tasks = await prisma.task.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 8
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
