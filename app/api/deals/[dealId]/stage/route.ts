import { DealStage } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "../../../../../src/lib/db";
import { rateLimit } from "../../../../../src/lib/rate-limit";

export async function PATCH(request: Request, { params }: { params: { dealId: string } }) {
  const origin = request.headers.get("origin");
  const csrfToken = request.headers.get("x-csrf-token");
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  if (origin && origin !== appUrl && !csrfToken) {
    return NextResponse.json({ error: "CSRF validation failed." }, { status: 403 });
  }
  const rate = rateLimit("deal-stage", 20, 60000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const body = await request.json();
  const stage = body.stage;
  if (!stage || !Object.values(DealStage).includes(stage)) {
    return NextResponse.json({ error: "Invalid stage." }, { status: 400 });
  }

  const deal = await prisma.deal.update({
    where: { id: params.dealId },
    data: { stage },
    include: { company: true, primaryContact: true }
  });

  const response = NextResponse.json({ deal });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "PATCH,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "PATCH,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}
