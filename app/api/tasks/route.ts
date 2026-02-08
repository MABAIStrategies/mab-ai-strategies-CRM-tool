import { NextResponse } from "next/server";
import { prisma } from "../../../src/lib/db";
import { rateLimit } from "../../../src/lib/rate-limit";

const appUrl = process.env.APP_URL ?? "http://localhost:3000";

const taskStatuses = ["TODO", "DOING", "DONE"];

const parseDate = (value: unknown) => {
  if (!value) {
    return null;
  }
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
};

export async function GET(request: Request) {
  const origin = request.headers.get("origin");
  const csrfToken = request.headers.get("x-csrf-token");
  if (origin && origin !== appUrl && !csrfToken) {
    return NextResponse.json({ error: "CSRF validation failed." }, { status: 403 });
  }
  const rate = rateLimit("tasks", 30, 60000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const tasks = await prisma.task.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: { company: true, deal: true, contact: true }
  });

  const response = NextResponse.json({ tasks });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const csrfToken = request.headers.get("x-csrf-token");
  if (origin && origin !== appUrl && !csrfToken) {
    return NextResponse.json({ error: "CSRF validation failed." }, { status: 403 });
  }
  const rate = rateLimit("tasks", 20, 60000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }
  const body = await request.json();
  if (!body.title || typeof body.title !== "string") {
    return NextResponse.json({ error: "title is required." }, { status: 400 });
  }

  if (body.companyId) {
    const company = await prisma.company.findFirst({
      where: { id: body.companyId, deletedAt: null }
    });
    if (!company) {
      return NextResponse.json({ error: "Company not found." }, { status: 400 });
    }
  }
  if (body.dealId) {
    const deal = await prisma.deal.findFirst({
      where: { id: body.dealId, deletedAt: null }
    });
    if (!deal) {
      return NextResponse.json({ error: "Deal not found." }, { status: 400 });
    }
  }
  if (body.contactId) {
    const contact = await prisma.contact.findFirst({
      where: { id: body.contactId, deletedAt: null }
    });
    if (!contact) {
      return NextResponse.json({ error: "Contact not found." }, { status: 400 });
    }
  }

  const task = await prisma.task.create({
    data: {
      companyId: typeof body.companyId === "string" ? body.companyId : null,
      dealId: typeof body.dealId === "string" ? body.dealId : null,
      contactId: typeof body.contactId === "string" ? body.contactId : null,
      title: body.title,
      description: typeof body.description === "string" ? body.description : null,
      dueAt: parseDate(body.dueAt),
      status:
        typeof body.status === "string" && taskStatuses.includes(body.status)
          ? body.status
          : "TODO"
    }
  });

  const response = NextResponse.json({ task }, { status: 201 });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}
