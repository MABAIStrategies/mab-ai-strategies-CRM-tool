import { MemorySourceType } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../src/lib/db";
import { buildSearchText, upsertMemoryVector } from "../../../../src/lib/memory";

const updateSchema = z.object({
  sourceType: z.nativeEnum(MemorySourceType).optional(),
  sourceId: z.string().min(1).optional(),
  companyId: z.string().optional().nullable(),
  dealId: z.string().optional().nullable(),
  contactId: z.string().optional().nullable(),
  extractedFacts: z.record(z.any()).or(z.array(z.any())).optional(),
  searchText: z.string().max(4000).optional().nullable(),
  updatedBy: z.string().max(120).optional().nullable()
});

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const memoryItem = await prisma.memoryItem.findFirst({
    where: { id: params.id, deletedAt: null }
  });

  if (!memoryItem) {
    return NextResponse.json({ error: "Memory item not found." }, { status: 404 });
  }

  return NextResponse.json({ memoryItem });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const existing = await prisma.memoryItem.findFirst({
    where: { id: params.id, deletedAt: null }
  });

  if (!existing) {
    return NextResponse.json({ error: "Memory item not found." }, { status: 404 });
  }

  const payload = updateSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json(
      { error: "Invalid update payload.", issues: payload.error.flatten() },
      { status: 400 }
    );
  }

  const updated = await prisma.memoryItem.update({
    where: { id: params.id },
    data: {
      sourceType: payload.data.sourceType,
      sourceId: payload.data.sourceId,
      companyId: payload.data.companyId,
      dealId: payload.data.dealId,
      contactId: payload.data.contactId,
      extractedFacts: payload.data.extractedFacts,
      searchText: payload.data.searchText,
      updatedBy: payload.data.updatedBy
    }
  });

  const refreshedSearchText = buildSearchText({
    sourceType: updated.sourceType,
    sourceId: updated.sourceId,
    searchText: updated.searchText,
    extractedFacts: updated.extractedFacts
  });

  if (refreshedSearchText !== updated.searchText) {
    await prisma.memoryItem.update({
      where: { id: updated.id },
      data: { searchText: refreshedSearchText }
    });
  }

  await upsertMemoryVector(updated.id, refreshedSearchText);

  return NextResponse.json({ memoryItem: { ...updated, searchText: refreshedSearchText } });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.memoryItem.update({
    where: { id: params.id },
    data: { deletedAt: new Date() }
  });

  return NextResponse.json({ ok: true });
}
