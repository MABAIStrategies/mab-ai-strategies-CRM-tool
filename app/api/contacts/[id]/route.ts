import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../../../src/lib/db";
import { rateLimit } from "../../../../src/lib/rate-limit";

const appUrl = process.env.APP_URL ?? "http://localhost:3000";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const origin = request.headers.get("origin");
  const csrfToken = request.headers.get("x-csrf-token");
  if (origin && origin !== appUrl && !csrfToken) {
    return NextResponse.json({ error: "CSRF validation failed." }, { status: 403 });
  }
  const rate = rateLimit("contact-detail", 60, 60000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const contact = await prisma.contact.findFirst({
    where: { id: params.id, deletedAt: null },
    include: { company: true }
  });

  if (!contact) {
    return NextResponse.json({ error: "Contact not found." }, { status: 404 });
  }

  const response = NextResponse.json({ contact });
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
  const rate = rateLimit("contact-detail", 20, 60000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }
  const body = await request.json();
  const data: Prisma.ContactUncheckedUpdateInput = {};

  if (body.companyId !== undefined) {
    if (typeof body.companyId !== "string") {
      return NextResponse.json({ error: "companyId must be a string." }, { status: 400 });
    }
    const company = await prisma.company.findFirst({
      where: { id: body.companyId, deletedAt: null }
    });
    if (!company) {
      return NextResponse.json({ error: "Company not found." }, { status: 400 });
    }
    data.companyId = body.companyId;
  }
  if (body.name !== undefined) {
    if (typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json({ error: "name must be a non-empty string." }, { status: 400 });
    }
    data.name = body.name;
  }
  if (body.title !== undefined) {
    if (body.title !== null && typeof body.title !== "string") {
      return NextResponse.json({ error: "title must be a string." }, { status: 400 });
    }
    data.title = body.title ? body.title : null;
  }
  if (body.email !== undefined) {
    if (body.email !== null && typeof body.email !== "string") {
      return NextResponse.json({ error: "email must be a string." }, { status: 400 });
    }
    data.email = body.email ? body.email : null;
  }
  if (body.phone !== undefined) {
    if (body.phone !== null && typeof body.phone !== "string") {
      return NextResponse.json({ error: "phone must be a string." }, { status: 400 });
    }
    data.phone = body.phone ? body.phone : null;
  }
  if (body.linkedinUrl !== undefined) {
    if (body.linkedinUrl !== null && typeof body.linkedinUrl !== "string") {
      return NextResponse.json({ error: "linkedinUrl must be a string." }, { status: 400 });
    }
    data.linkedinUrl = body.linkedinUrl ? body.linkedinUrl : null;
  }
  if (body.relationshipStrength !== undefined) {
    if (typeof body.relationshipStrength !== "number") {
      return NextResponse.json({ error: "relationshipStrength must be a number." }, { status: 400 });
    }
    data.relationshipStrength = body.relationshipStrength;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
  }

  const contact = await prisma.contact.update({
    where: { id: params.id },
    data
  });

  const response = NextResponse.json({ contact });
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
  const rate = rateLimit("contact-detail", 10, 60000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const contact = await prisma.contact.update({
    where: { id: params.id },
    data: { deletedAt: new Date() }
  });

  const response = NextResponse.json({ contact });
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
