import { NextResponse } from "next/server";
import { prisma } from "../../../src/lib/db";
import { rateLimit } from "../../../src/lib/rate-limit";

export async function GET(request: Request) {
  const origin = request.headers.get("origin");
  const csrfToken = request.headers.get("x-csrf-token");
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  if (origin && origin !== appUrl && !csrfToken) {
    return NextResponse.json({ error: "CSRF validation failed." }, { status: 403 });
  }
  const rate = rateLimit("tasks", 40, 60000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId") ?? undefined;
  const dealId = searchParams.get("dealId") ?? undefined;

  const tasks = await prisma.task.findMany({
    where: {
      deletedAt: null,
      ...(companyId ? { companyId } : {}),
      ...(dealId ? { dealId } : {})
    },
    include: {
      company: true,
      deal: true
    },
    orderBy: { dueAt: "asc" },
    take: 8
  });

  const response = NextResponse.json({ tasks });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}
