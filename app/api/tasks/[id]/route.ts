import { NextResponse } from "next/server";
import { prisma } from "../../../../src/lib/db";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();

  const task = await prisma.task.update({
    where: { id: params.id },
    data: {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.dueAt !== undefined ? { dueAt: body.dueAt ? new Date(body.dueAt) : null } : {})
    }
  });

  return NextResponse.json({ task });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  await prisma.task.update({
    where: { id: params.id },
    data: { deletedAt: new Date() }
  });

  return NextResponse.json({ ok: true });
}
