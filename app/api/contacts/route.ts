import { NextResponse } from "next/server";
import { prisma } from "../../../src/lib/db";
import { rateLimit } from "../../../src/lib/rate-limit";

const appUrl = process.env.APP_URL ?? "http://localhost:3000";

export async function GET(request: Request) {
  const origin = request.headers.get("origin");
  const csrfToken = request.headers.get("x-csrf-token");
  if (origin && origin !== appUrl && !csrfToken) {
    return NextResponse.json({ error: "CSRF validation failed." }, { status: 403 });
  }
  const rate = rateLimit("contacts", 30, 60000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const contacts = await prisma.contact.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: { company: true }
  });

  const response = NextResponse.json({ contacts });
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
  const rate = rateLimit("contacts", 20, 60000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }
  const body = await request.json();
  if (!body.companyId || typeof body.companyId !== "string") {
    return NextResponse.json({ error: "companyId is required." }, { status: 400 });
  }
  if (!body.name || typeof body.name !== "string") {
    return NextResponse.json({ error: "name is required." }, { status: 400 });
  }

  const company = await prisma.company.findFirst({
    where: { id: body.companyId, deletedAt: null }
  });
  if (!company) {
    return NextResponse.json({ error: "Company not found." }, { status: 400 });
  }

  const contact = await prisma.contact.create({
    data: {
      companyId: body.companyId,
      name: body.name,
      title: typeof body.title === "string" ? body.title : null,
      email: typeof body.email === "string" ? body.email : null,
      phone: typeof body.phone === "string" ? body.phone : null,
      linkedinUrl: typeof body.linkedinUrl === "string" ? body.linkedinUrl : null,
      relationshipStrength:
        typeof body.relationshipStrength === "number" ? body.relationshipStrength : 50
    }
  });

  const response = NextResponse.json({ contact }, { status: 201 });
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
