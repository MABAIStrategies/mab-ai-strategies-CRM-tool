import { ActivityType } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "../../../src/lib/db";
import { rateLimit } from "../../../src/lib/rate-limit";

export async function GET(request: Request) {
  const origin = request.headers.get("origin");
  const csrfToken = request.headers.get("x-csrf-token");
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  if (origin && origin !== appUrl && !csrfToken) {
    return NextResponse.json({ error: "CSRF validation failed." }, { status: 403 });
  }
  const rate = rateLimit("activities", 40, 60000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId") ?? undefined;
  const dealId = searchParams.get("dealId") ?? undefined;

  const activities = await prisma.activity.findMany({
    where: {
      deletedAt: null,
      ...(companyId ? { companyId } : {}),
      ...(dealId ? { dealId } : {})
    },
    include: {
      contact: true
    },
    orderBy: { occurredAt: "desc" },
    take: 12
  });

  const response = NextResponse.json({ activities });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const csrfToken = request.headers.get("x-csrf-token");
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  if (origin && origin !== appUrl && !csrfToken) {
    return NextResponse.json({ error: "CSRF validation failed." }, { status: 403 });
  }
  const rate = rateLimit("activities", 20, 60000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const body = await request.json();
  if (!body.companyId || typeof body.companyId !== "string") {
    return NextResponse.json({ error: "companyId is required." }, { status: 400 });
  }

  const type = body.type ?? ActivityType.OTHER;
  if (!Object.values(ActivityType).includes(type)) {
    return NextResponse.json({ error: "Invalid activity type." }, { status: 400 });
  }

  const occurredAt = body.occurredAt ? new Date(body.occurredAt) : new Date();

  const activity = await prisma.activity.create({
    data: {
      companyId: body.companyId,
      dealId: body.dealId ?? null,
      contactId: body.contactId ?? null,
      type,
      occurredAt,
      durationMinutes: body.durationMinutes ?? null,
      outcome: body.outcome ?? null
    },
    include: {
      contact: true
    }
  });

  const response = NextResponse.json({ activity });
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
