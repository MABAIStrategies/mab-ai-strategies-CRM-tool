import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../../../src/lib/db";
import { rateLimit } from "../../../../src/lib/rate-limit";

const appUrl = process.env.APP_URL ?? "http://localhost:3000";

const dealStages = [
  "PROSPECT_IDENTIFIED",
  "ENRICHED",
  "OUTREACH_SENT",
  "DISCOVERY_SCHEDULED",
  "DISCOVERY_COMPLETED",
  "OFFER_PRESENTED",
  "PROPOSAL_SENT",
  "CLOSED_WON",
  "CLOSED_LOST",
  "DELIVERY_IN_PROGRESS",
  "DELIVERY_COMPLETE"
];

const offerTypes = ["AUDIT", "BLUEPRINT", "LEAD_LIST", "IMPLEMENTATION", "OTHER"];

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
  const rate = rateLimit("deal-detail", 60, 60000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const deal = await prisma.deal.findFirst({
    where: { id: params.id, deletedAt: null },
    include: { company: true, primaryContact: true }
  });

  if (!deal) {
    return NextResponse.json({ error: "Deal not found." }, { status: 404 });
  }

  const response = NextResponse.json({ deal });
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
  const rate = rateLimit("deal-detail", 20, 60000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }
  const body = await request.json();
  const data: Prisma.DealUncheckedUpdateInput = {};

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
  if (body.primaryContactId !== undefined) {
    if (body.primaryContactId !== null && typeof body.primaryContactId !== "string") {
      return NextResponse.json({ error: "primaryContactId must be a string." }, { status: 400 });
    }
    if (body.primaryContactId) {
      const contact = await prisma.contact.findFirst({
        where: { id: body.primaryContactId, deletedAt: null }
      });
      if (!contact) {
        return NextResponse.json({ error: "Primary contact not found." }, { status: 400 });
      }
    }
    data.primaryContactId = body.primaryContactId ? body.primaryContactId : null;
  }
  if (body.stage !== undefined) {
    if (typeof body.stage !== "string" || !dealStages.includes(body.stage)) {
      return NextResponse.json({ error: "stage must be a valid value." }, { status: 400 });
    }
    data.stage = body.stage;
  }
  if (body.value !== undefined) {
    if (body.value !== null && typeof body.value !== "number") {
      return NextResponse.json({ error: "value must be a number." }, { status: 400 });
    }
    data.value = body.value !== null ? body.value : null;
  }
  if (body.probability !== undefined) {
    if (typeof body.probability !== "number") {
      return NextResponse.json({ error: "probability must be a number." }, { status: 400 });
    }
    data.probability = body.probability;
  }
  if (body.closeDate !== undefined) {
    const parsed = parseDate(body.closeDate);
    if (body.closeDate && !parsed) {
      return NextResponse.json({ error: "closeDate must be a valid date." }, { status: 400 });
    }
    data.closeDate = parsed;
  }
  if (body.offerType !== undefined) {
    if (typeof body.offerType !== "string" || !offerTypes.includes(body.offerType)) {
      return NextResponse.json({ error: "offerType must be a valid value." }, { status: 400 });
    }
    data.offerType = body.offerType;
  }
  if (body.objections !== undefined) {
    if (body.objections !== null && typeof body.objections !== "string") {
      return NextResponse.json({ error: "objections must be a string." }, { status: 400 });
    }
    data.objections = body.objections ? body.objections : null;
  }
  if (body.roiDrivers !== undefined) {
    if (body.roiDrivers !== null && typeof body.roiDrivers !== "string") {
      return NextResponse.json({ error: "roiDrivers must be a string." }, { status: 400 });
    }
    data.roiDrivers = body.roiDrivers ? body.roiDrivers : null;
  }
  if (body.nextStepDate !== undefined) {
    const parsed = parseDate(body.nextStepDate);
    if (body.nextStepDate && !parsed) {
      return NextResponse.json({ error: "nextStepDate must be a valid date." }, { status: 400 });
    }
    data.nextStepDate = parsed;
  }
  if (body.momentumScore !== undefined) {
    if (typeof body.momentumScore !== "number") {
      return NextResponse.json({ error: "momentumScore must be a number." }, { status: 400 });
    }
    data.momentumScore = body.momentumScore;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
  }

  const deal = await prisma.deal.update({
    where: { id: params.id },
    data
  });

  const response = NextResponse.json({ deal });
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
  const rate = rateLimit("deal-detail", 10, 60000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const deal = await prisma.deal.update({
    where: { id: params.id },
    data: { deletedAt: new Date() }
  });

  const response = NextResponse.json({ deal });
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
