import { Prisma, type Note } from "@prisma/client";
import { getAIProvider, sanitizeInput, type StructuredExtract } from "./ai-provider";
import { prisma } from "./db";

const ai = getAIProvider();
const MAX_SEARCH_TEXT_LENGTH = 4000;

export type MemorySearchHit = {
  id: string;
  sourceType: string;
  sourceId: string;
  searchText: string | null;
  createdAt: Date;
  companyName: string | null;
  matchType: "semantic" | "keyword";
};

export const isPgVectorEnabled = () => process.env.PGVECTOR_ENABLED === "true";

const trimSearchText = (text: string) =>
  text.length > MAX_SEARCH_TEXT_LENGTH ? text.slice(0, MAX_SEARCH_TEXT_LENGTH) : text;

export function buildMemorySearchText(payload: {
  rawText: string;
  summary?: string | null;
  extract?: StructuredExtract | null;
}) {
  const extractText = payload.extract ? JSON.stringify(payload.extract) : "";
  const combined = [payload.rawText, payload.summary, extractText].filter(Boolean).join(" ");
  return trimSearchText(sanitizeInput(combined));
}

export async function generateEmbedding(text: string) {
  const cleaned = sanitizeInput(text);
  if (!cleaned) {
    return [];
  }
  return ai.embed(cleaned);
}

export function serializeEmbedding(embedding: number[]) {
  return Buffer.from(Float32Array.from(embedding).buffer);
}

export async function upsertMemoryItemForNote(payload: {
  note: Note;
  summary?: string | null;
  extract?: StructuredExtract | null;
  searchText?: string;
}) {
  const searchText =
    payload.searchText ??
    buildMemorySearchText({
      rawText: payload.note.rawText,
      summary: payload.summary,
      extract: payload.extract
    });
  const embedding = await generateEmbedding(searchText);
  const existing = await prisma.memoryItem.findFirst({
    where: { sourceType: "NOTE", sourceId: payload.note.id, deletedAt: null }
  });
  const data = {
    sourceType: "NOTE" as const,
    sourceId: payload.note.id,
    companyId: payload.note.companyId,
    dealId: payload.note.dealId,
    contactId: payload.note.contactId,
    extractedFacts: payload.extract ?? {},
    searchText,
    embedding: embedding.length ? serializeEmbedding(embedding) : null
  };

  if (existing) {
    return prisma.memoryItem.update({ where: { id: existing.id }, data });
  }

  return prisma.memoryItem.create({ data });
}

export async function searchMemoryItems(query: string, take = 5) {
  if (!query.trim()) {
    return [];
  }

  const keywordMatches = await prisma.memoryItem.findMany({
    where: {
      deletedAt: null,
      searchText: { contains: query, mode: "insensitive" }
    },
    include: { company: { select: { name: true } } },
    take,
    orderBy: { createdAt: "desc" }
  });

  const keywordHits: MemorySearchHit[] = keywordMatches.map((item) => ({
    id: item.id,
    sourceType: item.sourceType,
    sourceId: item.sourceId,
    searchText: item.searchText,
    createdAt: item.createdAt,
    companyName: item.company?.name ?? null,
    matchType: "keyword"
  }));

  if (!isPgVectorEnabled()) {
    return keywordHits;
  }

  try {
    const embedding = await generateEmbedding(query);
    if (!embedding.length) {
      return keywordHits;
    }
    const vectorLiteral = `[${embedding.join(",")}]`;
    const semanticMatches = await prisma.$queryRaw<
      Array<{
        id: string;
        sourceType: string;
        sourceId: string;
        searchText: string | null;
        createdAt: Date;
        companyName: string | null;
      }>
    >(
      Prisma.sql`
        SELECT
          m.id,
          m."sourceType",
          m."sourceId",
          m."searchText",
          m."createdAt",
          c.name as "companyName"
        FROM "MemoryItem" m
        LEFT JOIN "Company" c ON c.id = m."companyId"
        WHERE m."deletedAt" IS NULL
          AND m."embedding" IS NOT NULL
        ORDER BY m."embedding" <-> ${vectorLiteral}::vector
        LIMIT ${take}
      `
    );

    const semanticHits: MemorySearchHit[] = semanticMatches.map((item) => ({
      id: item.id,
      sourceType: item.sourceType,
      sourceId: item.sourceId,
      searchText: item.searchText,
      createdAt: item.createdAt,
      companyName: item.companyName,
      matchType: "semantic"
    }));

    const merged = new Map<string, MemorySearchHit>();
    semanticHits.forEach((hit) => merged.set(hit.id, hit));
    keywordHits.forEach((hit) => {
      if (!merged.has(hit.id)) {
        merged.set(hit.id, hit);
      }
    });

    return Array.from(merged.values()).slice(0, take);
  } catch (error) {
    console.warn("Vector search failed, using keyword matches only.", error);
    return keywordHits;
  }
}
