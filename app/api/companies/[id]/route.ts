import { NextResponse } from "next/server";
import { prisma } from "../../../../src/lib/db";
import { rateLimit } from "../../../../src/lib/rate-limit";

const appUrl = process.env.APP_URL ?? "http://localhost:3000";

const toStringArray = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const origin = request.headers.get("origin");
  const csrfToken = request.headers.get("x-csrf-token");
  if (origin && origin !== appUrl && !csrfToken) {
    return NextResponse.json({ error: "CSRF validation failed." }, { status: 403 });
  }
  const rate = rateLimit("company-detail", 60, 60000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const company = await prisma.company.findFirst({
    where: { id: params.id, deletedAt: null }
  });

  if (!company) {
    return NextResponse.json({ error: "Company not found." }, { status: 404 });
  }

  const response = NextResponse.json({ company });
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
  const rate = rateLimit("company-detail", 20, 60000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }
  const body = await request.json();
  const data: {
    name?: string;
    domain?: string | null;
    industry?: string | null;
    region?: string | null;
    icpTags?: string[];
    riskFlags?: string[];
    notesSummary?: string | null;
  } = {};

  if (body.name !== undefined) {
    if (typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json({ error: "name must be a non-empty string." }, { status: 400 });
    }
    data.name = body.name;
  }
  if (body.domain !== undefined) {
    if (body.domain !== null && typeof body.domain !== "string") {
      return NextResponse.json({ error: "domain must be a string." }, { status: 400 });
    }
    data.domain = body.domain ? body.domain : null;
  }
  if (body.industry !== undefined) {
    if (body.industry !== null && typeof body.industry !== "string") {
      return NextResponse.json({ error: "industry must be a string." }, { status: 400 });
    }
    data.industry = body.industry ? body.industry : null;
  }
  if (body.region !== undefined) {
    if (body.region !== null && typeof body.region !== "string") {
      return NextResponse.json({ error: "region must be a string." }, { status: 400 });
    }
    data.region = body.region ? body.region : null;
  }
  if (body.icpTags !== undefined) {
    data.icpTags = toStringArray(body.icpTags);
  }
  if (body.riskFlags !== undefined) {
    data.riskFlags = toStringArray(body.riskFlags);
  }
  if (body.notesSummary !== undefined) {
    if (body.notesSummary !== null && typeof body.notesSummary !== "string") {
      return NextResponse.json({ error: "notesSummary must be a string." }, { status: 400 });
    }
    data.notesSummary = body.notesSummary ? body.notesSummary : null;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
  }

  const company = await prisma.company.update({
    where: { id: params.id },
    data
  });

  const response = NextResponse.json({ company });
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
  const rate = rateLimit("company-detail", 10, 60000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const company = await prisma.company.update({
    where: { id: params.id },
    data: { deletedAt: new Date() }
  });

  const response = NextResponse.json({ company });
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
