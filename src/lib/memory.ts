import type { Asset, Note } from "@prisma/client";
import type { StructuredExtract } from "./ai-provider";
import { sanitizeInput } from "./ai-provider";
import { prisma } from "./db";
import { enqueueJob } from "./queue";

const MAX_EXCERPT_LENGTH = 320;

type MemoryPayload = {
  sourceType: "NOTE" | "ACTIVITY" | "ASSET";
  sourceId: string;
  companyId?: string | null;
  dealId?: string | null;
  contactId?: string | null;
  extractedFacts: Record<string, unknown>;
  searchText: string;
};

const flattenValue = (value: unknown): string[] => {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.flatMap((entry) => flattenValue(entry));
  }
  if (typeof value === "object") {
    return Object.values(value).flatMap((entry) => flattenValue(entry));
  }
  return [String(value)];
};

const normalizeSearchText = (segments: Array<string | string[] | undefined | null>) => {
  const parts = segments.flatMap((segment) => {
    if (!segment) {
      return [];
    }
    if (Array.isArray(segment)) {
      return segment;
    }
    return [segment];
  });
  return sanitizeInput(parts.join(" · ")).slice(0, 1000);
};

const buildExcerpt = (text: string) => {
  if (!text) {
    return "";
  }
  const normalized = sanitizeInput(text);
  if (normalized.length <= MAX_EXCERPT_LENGTH) {
    return normalized;
  }
  return `${normalized.slice(0, MAX_EXCERPT_LENGTH - 3)}...`;
};

const buildEmbedKey = (memoryItemId: string, searchText: string) => {
  let hash = 0;
  for (let index = 0; index < searchText.length; index += 1) {
    hash = (hash * 31 + searchText.charCodeAt(index)) >>> 0;
  }
  return `memory-embed-${memoryItemId}-${hash}`;
};

const createOrUpdateMemoryItem = async ({
  sourceType,
  sourceId,
  companyId,
  dealId,
  contactId,
  extractedFacts,
  searchText
}: MemoryPayload) => {
  const existing = await prisma.memoryItem.findFirst({
    where: { sourceType, sourceId, deletedAt: null }
  });

  const data = {
    sourceType,
    sourceId,
    companyId: companyId ?? null,
    dealId: dealId ?? null,
    contactId: contactId ?? null,
    extractedFacts,
    searchText
  };

  const memoryItem = existing
    ? await prisma.memoryItem.update({ where: { id: existing.id }, data })
    : await prisma.memoryItem.create({ data });

  if (searchText) {
    await enqueueJob({
      type: "MEMORY_EMBED",
      payload: { memoryItemId: memoryItem.id, text: searchText },
      idempotencyKey: buildEmbedKey(memoryItem.id, searchText)
    });
  }

  return memoryItem;
};

export async function syncMemoryFromNote({
  note,
  summary,
  extract
}: {
  note: Note;
  summary: string;
  extract: StructuredExtract;
}) {
  const extractHighlights = flattenValue(extract);
  const searchText = normalizeSearchText([
    note.rawText,
    summary,
    extractHighlights,
    note.tags
  ]);
  const excerpt = buildExcerpt(searchText);

  return createOrUpdateMemoryItem({
    sourceType: "NOTE",
    sourceId: note.id,
    companyId: note.companyId,
    dealId: note.dealId,
    contactId: note.contactId,
    extractedFacts: {
      summary,
      highlights: extractHighlights,
      tags: note.tags,
      excerpt
    },
    searchText
  });
}

export async function syncMemoryFromAsset(asset: Asset) {
  const searchText = normalizeSearchText([
    asset.title,
    asset.description ?? undefined,
    asset.tags,
    asset.type,
    asset.status
  ]);
  const excerpt = buildExcerpt(searchText);

  return createOrUpdateMemoryItem({
    sourceType: "ASSET",
    sourceId: asset.id,
    extractedFacts: {
      title: asset.title,
      description: asset.description ?? null,
      tags: asset.tags,
      status: asset.status,
      type: asset.type,
      excerpt
    },
    searchText
  });
}

export async function syncMemoryFromActivity({
  activityId,
  companyId,
  dealId,
  contactId,
  type,
  outcome
}: {
  activityId: string;
  companyId: string;
  dealId?: string | null;
  contactId?: string | null;
  type: string;
  outcome?: string | null;
}) {
  const searchText = normalizeSearchText([type, outcome ?? undefined]);
  const excerpt = buildExcerpt(searchText);

  return createOrUpdateMemoryItem({
    sourceType: "ACTIVITY",
    sourceId: activityId,
    companyId,
    dealId,
    contactId,
    extractedFacts: {
      type,
      outcome: outcome ?? null,
      excerpt
    },
    searchText
  });
}
