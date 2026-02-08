import { NextResponse } from "next/server";
import { prisma } from "../../../src/lib/db";
import { rateLimit } from "../../../src/lib/rate-limit";

const appUrl = process.env.APP_URL ?? "http://localhost:3000";

const toStringArray = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

export async function GET(request: Request) {
  const origin = request.headers.get("origin");
  const csrfToken = request.headers.get("x-csrf-token");
  if (origin && origin !== appUrl && !csrfToken) {
    return NextResponse.json({ error: "CSRF validation failed." }, { status: 403 });
  }
  const rate = rateLimit("companies", 30, 60000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const companies = await prisma.company.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" }
  });

  const response = NextResponse.json({ companies });
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
  const rate = rateLimit("companies", 20, 60000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }
  const body = await request.json();
  if (!body.name || typeof body.name !== "string") {
    return NextResponse.json({ error: "name is required." }, { status: 400 });
  }

  const company = await prisma.company.create({
    data: {
      name: body.name,
      domain: typeof body.domain === "string" ? body.domain : null,
      industry: typeof body.industry === "string" ? body.industry : null,
      region: typeof body.region === "string" ? body.region : null,
      icpTags: toStringArray(body.icpTags),
      riskFlags: toStringArray(body.riskFlags),
      notesSummary: typeof body.notesSummary === "string" ? body.notesSummary : null
    }
  });

  const response = NextResponse.json({ company }, { status: 201 });
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
