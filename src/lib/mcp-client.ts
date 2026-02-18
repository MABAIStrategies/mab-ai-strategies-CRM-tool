import { z } from "zod";

const inboundEventSchema = z.object({
  id: z.string(),
  source: z.enum(["email", "calendar"]),
  subject: z.string().optional(),
  summary: z.string().optional(),
  occurredAt: z.string().datetime().optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  organizer: z.string().optional(),
  attendees: z.array(z.string()).optional(),
  actionItems: z.array(z.string()).optional(),
  companyId: z.string().optional(),
  dealId: z.string().optional(),
  contactId: z.string().optional()
});

export type InboundEvent = z.infer<typeof inboundEventSchema>;

const inboundResponseSchema = z.object({
  events: z.array(inboundEventSchema)
});

export async function fetchInboundEvents(): Promise<InboundEvent[]> {
  const mcpUrl = process.env.MCP_INBOUND_URL;
  if (!mcpUrl) {
    return [];
  }
  const response = await fetch(mcpUrl, {
    headers: {
      Authorization: process.env.MCP_API_KEY ? `Bearer ${process.env.MCP_API_KEY}` : ""
    },
    cache: "no-store"
  });
  if (!response.ok) {
    return [];
  }
  const payload = await response.json();
  const parsed = inboundResponseSchema.safeParse(payload);
  if (parsed.success) {
    return parsed.data.events;
  }
  const arrayParsed = z.array(inboundEventSchema).safeParse(payload);
  return arrayParsed.success ? arrayParsed.data : [];
}
