import { NextResponse } from "next/server";
import { prisma } from "../../../src/lib/db";
import { rateLimit } from "../../../src/lib/rate-limit";
import { getAIProvider } from "../../../src/lib/ai-provider";

export async function POST(request: Request) {
  const rate = rateLimit("enrich", 10, 60000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const body = await request.json();
  const companyId = body.companyId as string;

  if (!companyId) {
    return NextResponse.json({ error: "companyId is required." }, { status: 400 });
  }

  const company = await prisma.company.findFirst({
    where: { id: companyId, deletedAt: null }
  });

  if (!company) {
    return NextResponse.json({ error: "Company not found." }, { status: 404 });
  }

  const ai = getAIProvider();
  let enrichedData: Record<string, unknown> = {};

  if (company.domain) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(`https://${company.domain}`, {
        signal: controller.signal,
        headers: { "User-Agent": "MAB-CRM-LeadEnrichment/1.0" }
      });
      clearTimeout(timeout);

      if (res.ok) {
        const html = await res.text();
        const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
        const metaDesc = html.match(
          /<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i
        );
        enrichedData.websiteTitle = titleMatch?.[1] ?? "";
        enrichedData.websiteDescription = metaDesc?.[1] ?? "";
      }
    } catch {
      // Domain unreachable
    }

    try {
      const aiEnrichment = await ai.enrichCompany(company.domain);
      enrichedData = { ...enrichedData, ...aiEnrichment };
    } catch {
      // AI enrichment failed, continue with what we have
    }
  }

  const updatedCompany = await prisma.company.update({
    where: { id: companyId },
    data: {
      enrichedData: enrichedData as Record<string, string | string[]>,
      ...(enrichedData.industry && !company.industry
        ? { industry: enrichedData.industry as string }
        : {})
    }
  });

  return NextResponse.json({
    company: updatedCompany,
    enrichedData
  });
}
