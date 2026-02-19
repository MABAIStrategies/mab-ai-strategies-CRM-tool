import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getAIProvider, sanitizeInput } from "../../../src/lib/ai-provider";
import { prisma } from "../../../src/lib/db";
import { searchMemoryItems } from "../../../src/lib/memory";
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
  const query = searchParams.get("q")?.trim() ?? "";
  if (!query) {
    const emptyResponse = NextResponse.json({
      companies: [],
      notes: [],
      memoryItems: []
    });
    emptyResponse.headers.set("Access-Control-Allow-Origin", "*");
    emptyResponse.headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    emptyResponse.headers.set("Access-Control-Allow-Headers", "Content-Type");
    return emptyResponse;
  }

  const [companies, notes, memoryItems] = await Promise.all([
    prisma.company.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      take: 5,
      select: {
        id: true,
        name: true,
        industry: true,
        region: true,
        domain: true
      }
    }),
    prisma.note.findMany({
      where: {
        deletedAt: null,
        OR: [
          { searchText: { contains: query, mode: "insensitive" } },
          { summary: { contains: query, mode: "insensitive" } },
          { rawText: { contains: query, mode: "insensitive" } }
        ]
      },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        company: { select: { name: true } }
      }
    }),
    searchMemoryItems(query, 5)
  ]);

  const response = NextResponse.json({ companies, notes, memoryItems });
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
