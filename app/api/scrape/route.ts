import { NextResponse } from "next/server";
import { prisma } from "../../../src/lib/db";
import { rateLimit } from "../../../src/lib/rate-limit";

export async function POST(request: Request) {
  const rate = rateLimit("scrape", 10, 60000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const body = await request.json();
  const domain = body.domain as string;

  if (!domain || typeof domain !== "string") {
    return NextResponse.json({ error: "domain is required." }, { status: 400 });
  }

  const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").toLowerCase();

  try {
    const urls = [
      `https://${cleanDomain}`,
      `https://${cleanDomain}/contact`,
      `https://${cleanDomain}/about`,
      `https://${cleanDomain}/team`
    ];

    const emails = new Set<string>();
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const excludePatterns = /\.(png|jpg|gif|svg|css|js|woff)$/i;

    for (const url of urls) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(url, {
          signal: controller.signal,
          headers: {
            "User-Agent": "MAB-CRM-LeadEnrichment/1.0"
          }
        });
        clearTimeout(timeout);

        if (res.ok) {
          const html = await res.text();
          const matches = html.match(emailRegex) ?? [];
          for (const email of matches) {
            if (!excludePatterns.test(email)) {
              emails.add(email.toLowerCase());
            }
          }
        }
      } catch {
        // Skip unreachable pages
      }
    }

    const foundEmails = Array.from(emails).slice(0, 20);

    let company = await prisma.company.findFirst({
      where: { domain: cleanDomain, deletedAt: null }
    });

    if (!company && body.companyId) {
      company = await prisma.company.findFirst({
        where: { id: body.companyId, deletedAt: null }
      });
    }

    const createdContacts = [];
    if (company) {
      for (const email of foundEmails) {
        const existing = await prisma.contact.findFirst({
          where: { email, companyId: company.id, deletedAt: null }
        });
        if (!existing) {
          const nameGuess = email.split("@")[0].replace(/[._-]/g, " ");
          const contact = await prisma.contact.create({
            data: {
              companyId: company.id,
              name: nameGuess.charAt(0).toUpperCase() + nameGuess.slice(1),
              email,
              source: "web-scrape",
              relationshipStrength: 20
            }
          });
          createdContacts.push(contact);
        }
      }
    }

    return NextResponse.json({
      domain: cleanDomain,
      emailsFound: foundEmails,
      contactsCreated: createdContacts.length,
      contacts: createdContacts
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to scrape domain.", details: (error as Error).message },
      { status: 500 }
    );
  }
}
