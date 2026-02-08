import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getAIProvider, sanitizeInput } from "../../../src/lib/ai-provider";
import { prisma } from "../../../src/lib/db";
import { rateLimit } from "../../../src/lib/rate-limit";

const ai = getAIProvider();

type MemorySearchRow = {
  id: string;
  sourceType: "NOTE" | "ACTIVITY" | "ASSET" | "EMAIL" | "DOC_LINK" | "OTHER";
  sourceId: string;
  companyId: string | null;
  dealId: string | null;
  contactId: string | null;
  searchText: string | null;
  extractedFacts: Prisma.JsonValue;
  distance: number;
  createdAt: Date;
};

type SearchResult =
  | {
      type: "company";
      id: string;
      title: string;
      subtitle: string;
      href: string;
    }
  | {
      type: "memory";
      id: string;
      sourceType: MemorySearchRow["sourceType"];
      sourceId: string;
      title: string;
      excerpt: string;
      distance: number;
      href: string;
    };

const buildMemoryHref = (sourceType: MemorySearchRow["sourceType"], sourceId: string) => {
  switch (sourceType) {
    case "ASSET":
      return `/assets?asset=${sourceId}`;
    case "ACTIVITY":
      return `/workspace/activity?activity=${sourceId}`;
    case "NOTE":
      return `/workspace?note=${sourceId}`;
    default:
      return "/workspace";
  }
};

const buildMemoryTitle = (sourceType: MemorySearchRow["sourceType"], extractedFacts: Prisma.JsonValue) => {
  if (extractedFacts && typeof extractedFacts === "object" && !Array.isArray(extractedFacts)) {
    const facts = extractedFacts as Record<string, unknown>;
    const title = facts.title;
    const summary = facts.summary;
    if (typeof title === "string" && title.trim()) {
      return title;
    }
    if (typeof summary === "string" && summary.trim()) {
      return summary;
    }
  }
  const label = sourceType.toLowerCase().replace("_", " ");
  return `Memory signal · ${label}`;
};

const buildMemoryExcerpt = (searchText: string | null, extractedFacts: Prisma.JsonValue) => {
  if (extractedFacts && typeof extractedFacts === "object" && !Array.isArray(extractedFacts)) {
    const facts = extractedFacts as Record<string, unknown>;
    const excerpt = facts.excerpt;
    if (typeof excerpt === "string" && excerpt.trim()) {
      return excerpt;
    }
  }
  if (!searchText) {
    return "Semantic memory snippet is being indexed.";
  }
  return searchText.length > 180 ? `${searchText.slice(0, 177)}...` : searchText;
};

export async function GET(request: Request) {
  const origin = request.headers.get("origin");
  const csrfToken = request.headers.get("x-csrf-token");
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  if (origin && origin !== appUrl && !csrfToken) {
    return NextResponse.json({ error: "CSRF validation failed." }, { status: 403 });
  }
  const rate = rateLimit("search", 30, 60000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded." },
      { status: 429 }
    );
  }
  const { searchParams } = new URL(request.url);
  const query = sanitizeInput(searchParams.get("q") ?? "");

  if (!query) {
    const response = NextResponse.json({ results: [] satisfies SearchResult[] });
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type");
    return response;
  }

  const companies = await prisma.company.findMany({
    where: { name: { contains: query, mode: "insensitive" } },
    take: 4
  });

  const embedding = await ai.embed(query);
  const vectorLiteral = `'[${embedding.map((value) => Number(value).toFixed(6)).join(",")}]'`;

  const memoryRows = await prisma.$queryRaw<MemorySearchRow[]>`
    SELECT
      id,
      "sourceType",
      "sourceId",
      "companyId",
      "dealId",
      "contactId",
      "searchText",
      "extractedFacts",
      "createdAt",
      ("embedding" <-> ${Prisma.raw(`${vectorLiteral}::vector`)}) AS distance
    FROM "MemoryItem"
    WHERE "embedding" IS NOT NULL AND "deletedAt" IS NULL
    ORDER BY distance ASC
    LIMIT 10
  `;

  const memoryResults: SearchResult[] = memoryRows.map((row) => ({
    type: "memory",
    id: row.id,
    sourceType: row.sourceType,
    sourceId: row.sourceId,
    title: buildMemoryTitle(row.sourceType, row.extractedFacts),
    excerpt: buildMemoryExcerpt(row.searchText, row.extractedFacts),
    distance: row.distance,
    href: buildMemoryHref(row.sourceType, row.sourceId)
  }));

  const companyResults: SearchResult[] = companies.map((company) => ({
    type: "company",
    id: company.id,
    title: company.name,
    subtitle: company.industry ?? "Company account",
    href: `/workspace?company=${company.id}`
  }));

  const response = NextResponse.json({
    results: [...memoryResults, ...companyResults]
  });
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
