import { NextResponse } from "next/server";
import { prisma } from "../../../src/lib/db";
import { rateLimit } from "../../../src/lib/rate-limit";

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

export async function GET(request: Request) {
  const origin = request.headers.get("origin");
  const csrfToken = request.headers.get("x-csrf-token");
  if (origin && origin !== appUrl && !csrfToken) {
    return NextResponse.json({ error: "CSRF validation failed." }, { status: 403 });
  }
  const rate = rateLimit("deals", 30, 60000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const deals = await prisma.deal.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: { company: true, primaryContact: true }
  });

  const response = NextResponse.json({ deals });
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
  const rate = rateLimit("deals", 20, 60000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }
  const body = await request.json();
  if (!body.companyId || typeof body.companyId !== "string") {
    return NextResponse.json({ error: "companyId is required." }, { status: 400 });
  }
  if (!body.stage || typeof body.stage !== "string" || !dealStages.includes(body.stage)) {
    return NextResponse.json({ error: "stage is required." }, { status: 400 });
  }

  const company = await prisma.company.findFirst({
    where: { id: body.companyId, deletedAt: null }
  });
  if (!company) {
    return NextResponse.json({ error: "Company not found." }, { status: 400 });
  }

  if (body.primaryContactId) {
    const contact = await prisma.contact.findFirst({
      where: { id: body.primaryContactId, deletedAt: null }
    });
    if (!contact) {
      return NextResponse.json({ error: "Primary contact not found." }, { status: 400 });
    }
  }

  const deal = await prisma.deal.create({
    data: {
      companyId: body.companyId,
      primaryContactId: typeof body.primaryContactId === "string" ? body.primaryContactId : null,
      stage: body.stage,
      value: typeof body.value === "number" ? body.value : null,
      probability: typeof body.probability === "number" ? body.probability : 0,
      closeDate: parseDate(body.closeDate),
      offerType:
        typeof body.offerType === "string" && offerTypes.includes(body.offerType)
          ? body.offerType
          : "OTHER",
      objections: typeof body.objections === "string" ? body.objections : null,
      roiDrivers: typeof body.roiDrivers === "string" ? body.roiDrivers : null,
      nextStepDate: parseDate(body.nextStepDate),
      momentumScore: typeof body.momentumScore === "number" ? body.momentumScore : 0
    }
  });

  const response = NextResponse.json({ deal }, { status: 201 });
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
