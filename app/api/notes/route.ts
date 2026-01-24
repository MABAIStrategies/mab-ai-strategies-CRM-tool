import { NextResponse } from "next/server";
import { prisma } from "../../../src/lib/db";
import { enqueueJob } from "../../../src/lib/queue";
import { rateLimit } from "../../../src/lib/rate-limit";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const csrfToken = request.headers.get("x-csrf-token");
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  if (origin && origin !== appUrl && !csrfToken) {
    return NextResponse.json({ error: "CSRF validation failed." }, { status: 403 });
  }
  const rate = rateLimit("notes", 20, 60000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded." },
      { status: 429 }
    );
  }
  const body = await request.json();
  if (!body.rawText || typeof body.rawText !== "string") {
    return NextResponse.json({ error: "rawText is required." }, { status: 400 });
  }
  if (body.rawText.length > 800) {
    return NextResponse.json({ error: "rawText too long." }, { status: 400 });
  }
  const note = await prisma.note.create({
    data: {
      companyId: body.companyId ?? "demo-company",
      dealId: body.dealId,
      contactId: body.contactId,
      rawText: body.rawText,
      tags: body.tags ?? []
    }
  });

  await enqueueJob({
    type: "NOTE_PROCESS",
    payload: { noteId: note.id },
    idempotencyKey: `note-process-${note.id}`
  });

  const response = NextResponse.json({ note });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}
