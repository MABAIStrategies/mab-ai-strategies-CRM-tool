import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../../../src/lib/db";
import { rateLimit } from "../../../../src/lib/rate-limit";

const appUrl = process.env.APP_URL ?? "http://localhost:3000";

const taskStatuses = ["TODO", "DOING", "DONE"];

const parseDate = (value: unknown) => {
  if (!value) {
    return null;
  }
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const origin = request.headers.get("origin");
  const csrfToken = request.headers.get("x-csrf-token");
  if (origin && origin !== appUrl && !csrfToken) {
    return NextResponse.json({ error: "CSRF validation failed." }, { status: 403 });
  }
  const rate = rateLimit("task-detail", 60, 60000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const task = await prisma.task.findFirst({
    where: { id: params.id, deletedAt: null },
    include: { company: true, deal: true, contact: true }
  });

  if (!task) {
    return NextResponse.json({ error: "Task not found." }, { status: 404 });
  }

  const response = NextResponse.json({ task });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET,PUT,DELETE,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const origin = request.headers.get("origin");
  const csrfToken = request.headers.get("x-csrf-token");
  if (origin && origin !== appUrl && !csrfToken) {
    return NextResponse.json({ error: "CSRF validation failed." }, { status: 403 });
  }
  const rate = rateLimit("task-detail", 20, 60000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }
  const body = await request.json();
  const data: Prisma.TaskUncheckedUpdateInput = {};

  if (body.companyId !== undefined) {
    if (body.companyId !== null && typeof body.companyId !== "string") {
      return NextResponse.json({ error: "companyId must be a string." }, { status: 400 });
    }
    if (body.companyId) {
      const company = await prisma.company.findFirst({
        where: { id: body.companyId, deletedAt: null }
      });
      if (!company) {
        return NextResponse.json({ error: "Company not found." }, { status: 400 });
      }
    }
    data.companyId = body.companyId ? body.companyId : null;
  }
  if (body.dealId !== undefined) {
    if (body.dealId !== null && typeof body.dealId !== "string") {
      return NextResponse.json({ error: "dealId must be a string." }, { status: 400 });
    }
    if (body.dealId) {
      const deal = await prisma.deal.findFirst({
        where: { id: body.dealId, deletedAt: null }
      });
      if (!deal) {
        return NextResponse.json({ error: "Deal not found." }, { status: 400 });
      }
    }
    data.dealId = body.dealId ? body.dealId : null;
  }
  if (body.contactId !== undefined) {
    if (body.contactId !== null && typeof body.contactId !== "string") {
      return NextResponse.json({ error: "contactId must be a string." }, { status: 400 });
    }
    if (body.contactId) {
      const contact = await prisma.contact.findFirst({
        where: { id: body.contactId, deletedAt: null }
      });
      if (!contact) {
        return NextResponse.json({ error: "Contact not found." }, { status: 400 });
      }
    }
    data.contactId = body.contactId ? body.contactId : null;
  }
  if (body.title !== undefined) {
    if (typeof body.title !== "string" || !body.title.trim()) {
      return NextResponse.json({ error: "title must be a non-empty string." }, { status: 400 });
    }
    data.title = body.title;
  }
  if (body.description !== undefined) {
    if (body.description !== null && typeof body.description !== "string") {
      return NextResponse.json({ error: "description must be a string." }, { status: 400 });
    }
    data.description = body.description ? body.description : null;
  }
  if (body.dueAt !== undefined) {
    const parsed = parseDate(body.dueAt);
    if (body.dueAt && !parsed) {
      return NextResponse.json({ error: "dueAt must be a valid date." }, { status: 400 });
    }
    data.dueAt = parsed;
  }
  if (body.status !== undefined) {
    if (typeof body.status !== "string" || !taskStatuses.includes(body.status)) {
      return NextResponse.json({ error: "status must be a valid value." }, { status: 400 });
    }
    data.status = body.status;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
  }

  const task = await prisma.task.update({
    where: { id: params.id },
    data
  });

  const response = NextResponse.json({ task });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET,PUT,DELETE,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const origin = request.headers.get("origin");
  const csrfToken = request.headers.get("x-csrf-token");
  if (origin && origin !== appUrl && !csrfToken) {
    return NextResponse.json({ error: "CSRF validation failed." }, { status: 403 });
  }
  const rate = rateLimit("task-detail", 10, 60000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const task = await prisma.task.update({
    where: { id: params.id },
    data: { deletedAt: new Date() }
  });

  const response = NextResponse.json({ task });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET,PUT,DELETE,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET,PUT,DELETE,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}
