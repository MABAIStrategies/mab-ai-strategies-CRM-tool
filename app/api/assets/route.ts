import { NextResponse } from "next/server";
import { prisma } from "../../../src/lib/db";
import { enqueueJob } from "../../../src/lib/queue";
import { rateLimit } from "../../../src/lib/rate-limit";

export async function GET(request: Request) {
  const origin = request.headers.get("origin");
  const csrfToken = request.headers.get("x-csrf-token");
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  if (origin && origin !== appUrl && !csrfToken) {
    return NextResponse.json({ error: "CSRF validation failed." }, { status: 403 });
  }
  const rate = rateLimit("assets", 30, 60000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const assets = await prisma.asset.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" }
  });
  const response = NextResponse.json({ assets });
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
  const rate = rateLimit("assets", 20, 60000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }
  const body = await request.json();
  if (!body.title || typeof body.title !== "string") {
    return NextResponse.json({ error: "title is required." }, { status: 400 });
  }

  const asset = await prisma.asset.create({
    data: {
      type: body.type ?? "OTHER",
      title: body.title,
      description: body.description ?? null,
      tags: body.tags ?? [],
      version: body.version ?? "1.0",
      status: body.status ?? "DRAFT",
      storageUri: body.storageUri ?? "local://assets"
    }
  });

  await enqueueJob({
    type: "ASSET_CLASSIFY",
    payload: { assetId: asset.id },
    idempotencyKey: `asset-classify-${asset.id}`
  });

  const response = NextResponse.json({ asset });
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
