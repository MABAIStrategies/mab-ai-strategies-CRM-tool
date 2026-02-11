import { z } from "zod";

import type { StructuredExtract } from "./provider.js";

export const structuredExtractSchema = z.object({
  note: z.object({
    title: z.string().min(1).optional(),
    body: z.string().min(1),
    tags: z.array(z.string().min(1)).default([])
  }),
  memoryItems: z.array(
    z.object({
      content: z.string().min(1),
      kind: z.enum(["insight", "task", "fact"]),
      importance: z.number().min(0).max(1)
    })
  ),
  followUpDraft: z.string().min(1).optional()
});

export const validateStructuredExtract = (payload: unknown): StructuredExtract =>
  structuredExtractSchema.parse(payload);
