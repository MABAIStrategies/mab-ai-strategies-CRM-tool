import { MemorySourceType } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../src/lib/db";
import { createMemoryItem } from "../../../src/lib/memory";
import { rateLimit } from "../../../src/lib/rate-limit";

const createMemoryItemSchema = z.object({
  sourceType: z.nativeEnum(MemorySourceType),
  sourceId: z.string().min(1),
  companyId: z.string().optional().nullable(),
  dealId: z.string().optional().nullable(),
  contactId: z.string().optional().nullable(),
  extractedFacts: z.record(z.any()).or(z.array(z.any())),
  searchText: z.string().max(4000).optional().nullable(),
  createdBy: z.string().max(120).optional().nullable()
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sourceType = searchParams.get("sourceType") as MemorySourceType | null;
  const sourceId = searchParams.get("sourceId");

  const memoryItems = await prisma.memoryItem.findMany({
    where: {
      deletedAt: null,
      sourceType: sourceType ?? undefined,
      sourceId: sourceId ?? undefined
    },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return NextResponse.json({ memoryItems });
}

export async function POST(request: Request) {
  const rate = rateLimit("memory-items", 40, 60000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const payload = createMemoryItemSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json(
      { error: "Invalid memory payload.", issues: payload.error.flatten() },
      { status: 400 }
    );
  }

  const memoryItem = await createMemoryItem(payload.data);

  return NextResponse.json({ memoryItem }, { status: 201 });
}
