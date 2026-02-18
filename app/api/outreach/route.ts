import { NextResponse } from "next/server";
import { prisma } from "../../../src/lib/db";
import { rateLimit } from "../../../src/lib/rate-limit";
import { getAIProvider } from "../../../src/lib/ai-provider";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const rate = rateLimit("outreach", 30, 60000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const contactId = searchParams.get("contactId");
  const companyId = searchParams.get("companyId");
  const status = searchParams.get("status");

  const where = {
    deletedAt: null,
    ...(contactId ? { contactId } : {}),
    ...(companyId ? { companyId } : {}),
    ...(status ? { status: status as never } : {})
  };

  const logs = await prisma.outreachLog.findMany({
    where,
    include: {
      contact: { select: { id: true, name: true, email: true } },
      company: { select: { id: true, name: true } }
    },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return NextResponse.json({ outreach: logs });
}

export async function POST(request: Request) {
  const rate = rateLimit("outreach", 10, 60000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const body = await request.json();

  if (!body.contactId && !body.toEmail) {
    return NextResponse.json(
      { error: "contactId or toEmail is required." },
      { status: 400 }
    );
  }

  let toEmail = body.toEmail as string;
  let contactName = body.contactName ?? "there";
  let companyName = body.companyName ?? "";
  let companyId = body.companyId;
  let contactId = body.contactId;

  if (contactId) {
    const contact = await prisma.contact.findFirst({
      where: { id: contactId, deletedAt: null },
      include: { company: true }
    });
    if (contact) {
      toEmail = toEmail ?? contact.email;
      contactName = contact.name;
      companyName = contact.company.name;
      companyId = contact.companyId;
    }
  }

  if (!toEmail) {
    return NextResponse.json({ error: "No email address available." }, { status: 400 });
  }

  let subject = body.subject as string;
  let emailBody = body.body as string;

  if (!subject || !emailBody) {
    const ai = getAIProvider();
    const composed = await ai.composeOutreach({
      contactName,
      companyName,
      painPoints: body.painPoints ?? ["process efficiency"],
      offerType: body.offerType ?? "AUDIT",
      sequenceStep: body.sequenceStep ?? 1
    });
    subject = subject ?? composed.subject;
    emailBody = emailBody ?? composed.body;
  }

  const log = await prisma.outreachLog.create({
    data: {
      companyId: companyId ?? null,
      contactId: contactId ?? null,
      toEmail,
      fromEmail: process.env.FROM_EMAIL ?? "outreach@mabaistrategies.com",
      subject,
      body: emailBody,
      status: "DRAFT",
      sequenceStep: body.sequenceStep ?? 1
    },
    include: {
      contact: { select: { id: true, name: true } },
      company: { select: { id: true, name: true } }
    }
  });

  if (body.send) {
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const sendResult = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendKey}`
          },
          body: JSON.stringify({
            from: log.fromEmail,
            to: [toEmail],
            subject,
            text: emailBody
          })
        });

        if (sendResult.ok) {
          await prisma.outreachLog.update({
            where: { id: log.id },
            data: { status: "SENT", sentAt: new Date() }
          });
          return NextResponse.json({ outreach: { ...log, status: "SENT" }, sent: true });
        } else {
          const err = await sendResult.text();
          await prisma.outreachLog.update({
            where: { id: log.id },
            data: { status: "FAILED", errorMsg: err }
          });
          return NextResponse.json({ outreach: log, sent: false, error: err });
        }
      } catch (error) {
        await prisma.outreachLog.update({
          where: { id: log.id },
          data: { status: "FAILED", errorMsg: (error as Error).message }
        });
        return NextResponse.json({
          outreach: log,
          sent: false,
          error: (error as Error).message
        });
      }
    } else {
      return NextResponse.json({
        outreach: log,
        sent: false,
        note: "RESEND_API_KEY not configured. Email saved as draft."
      });
    }
  }

  return NextResponse.json({ outreach: log }, { status: 201 });
}
