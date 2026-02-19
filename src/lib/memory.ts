import { Prisma, MemorySourceType } from "@prisma/client";
import { getAIProvider, sanitizeInput } from "./ai-provider";
import { prisma } from "./db";

const ai = getAIProvider();

export const MEMORY_SEARCH_LIMIT = 12;

type MemoryInput = {
  sourceType: MemorySourceType;
  sourceId: string;
  companyId?: string | null;
  dealId?: string | null;
  contactId?: string | null;
  extractedFacts: Prisma.InputJsonValue;
  searchText?: string | null;
  createdBy?: string | null;
};

function toVectorLiteral(values: number[]) {
  return `[${values.join(",")}]`;
}

export async function upsertMemoryVector(memoryItemId: string, text: string) {
  const embedding = await ai.embed(sanitizeInput(text));
  const vectorLiteral = toVectorLiteral(embedding);

  await prisma.$executeRawUnsafe(
    `UPDATE \"MemoryItem\" SET embedding = $1::vector WHERE id = $2`,
    vectorLiteral,
    memoryItemId
  );

  return embedding;
}

export function buildSearchText(payload: {
  sourceType: MemorySourceType;
  sourceId: string;
  searchText?: string | null;
  extractedFacts: Prisma.InputJsonValue;
}) {
  const seed = payload.searchText?.trim() ?? "";
  if (seed.length > 0) {
    return seed;
  }

  const extracted = JSON.stringify(payload.extractedFacts);
  return `${payload.sourceType} ${payload.sourceId} ${extracted}`.slice(0, 4000);
}

export async function createMemoryItem(input: MemoryInput) {
  const normalizedSearchText = buildSearchText(input);

  const memoryItem = await prisma.memoryItem.create({
    data: {
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      companyId: input.companyId,
      dealId: input.dealId,
      contactId: input.contactId,
      extractedFacts: input.extractedFacts,
      searchText: normalizedSearchText,
      createdBy: input.createdBy,
      updatedBy: input.createdBy
    }
  });

  await upsertMemoryVector(memoryItem.id, normalizedSearchText);

  return memoryItem;
}

export async function semanticMemorySearch(query: string, limit = MEMORY_SEARCH_LIMIT) {
  const embedding = await ai.embed(sanitizeInput(query));
  const vectorLiteral = toVectorLiteral(embedding);

  return prisma.$queryRaw<
    Array<{
      id: string;
      sourceType: MemorySourceType;
      sourceId: string;
      companyId: string | null;
      dealId: string | null;
      contactId: string | null;
      searchText: string | null;
      extractedFacts: Prisma.JsonValue;
      similarity: number;
      createdAt: Date;
    }>
  >(Prisma.sql`
    SELECT
      m.id,
      m."sourceType",
      m."sourceId",
      m."companyId",
      m."dealId",
      m."contactId",
      m."searchText",
      m."extractedFacts",
      m."createdAt",
      (1 - (m.embedding <=> ${vectorLiteral}::vector)) AS similarity
    FROM "MemoryItem" m
    WHERE m."deletedAt" IS NULL
      AND m.embedding IS NOT NULL
    ORDER BY m.embedding <=> ${vectorLiteral}::vector
    LIMIT ${Math.max(1, Math.min(limit, 25))}
  `);
}
