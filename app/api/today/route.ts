import { ActivityType } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "../../../src/lib/db";
import { rateLimit } from "../../../src/lib/rate-limit";

const fallback = {
  priorityTasks: [
    "Prepare follow-up for Brightline Logistics (Deal: Implementation)",
    "Send proposal draft to HarborTech",
    "Confirm discovery agenda with Westbridge Capital"
  ],
  nextCalls: [
    "11:00 AM – Margo Lee (Westbridge Capital)",
    "2:30 PM – Liam Chen (Brightline Logistics)",
    "4:15 PM – Pre-brief with internal team"
  ],
  topDeals: [
    "Westbridge Capital — Momentum 92",
    "Brightline Logistics — Momentum 81",
    "HarborTech — Momentum 76"
  ]
};

export async function GET(request: Request) {
  const origin = request.headers.get("origin");
  const csrfToken = request.headers.get("x-csrf-token");
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  if (origin && origin !== appUrl && !csrfToken) {
    return NextResponse.json({ error: "CSRF validation failed." }, { status: 403 });
  }
  const rate = rateLimit("today", 30, 60000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const [tasks, activities, deals] = await Promise.all([
    prisma.task.findMany({
      where: { deletedAt: null },
      include: { company: true, deal: true },
      orderBy: { dueAt: "asc" },
      take: 5
    }),
    prisma.activity.findMany({
      where: {
        deletedAt: null,
        type: { in: [ActivityType.CALL, ActivityType.MEETING] }
      },
      include: { company: true, contact: true },
      orderBy: { occurredAt: "desc" },
      take: 5
    }),
    prisma.deal.findMany({
      where: { deletedAt: null },
      include: { company: true },
      orderBy: { momentumScore: "desc" },
      take: 5
    })
  ]);

  const priorityTasks = tasks.length
    ? tasks.map((task) =>
        `${task.title}${task.company ? ` · ${task.company.name}` : ""}${
          task.deal ? ` (${task.deal.stage.replace(/_/g, " ")})` : ""
        }`
      )
    : fallback.priorityTasks;

  const nextCalls = activities.length
    ? activities.map((activity) => {
        const time = activity.occurredAt.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit"
        });
        const contact = activity.contact?.name ? ` – ${activity.contact.name}` : "";
        const company = activity.company?.name ? ` (${activity.company.name})` : "";
        return `${time}${contact}${company}`;
      })
    : fallback.nextCalls;

  const topDeals = deals.length
    ? deals.map(
        (deal) =>
          `${deal.company?.name ?? "Deal"} — Momentum ${deal.momentumScore ?? 0}`
      )
    : fallback.topDeals;

  const response = NextResponse.json({ priorityTasks, nextCalls, topDeals });
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
