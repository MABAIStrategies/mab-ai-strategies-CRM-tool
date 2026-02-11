import { NextResponse } from "next/server";
import { prisma } from "../../../src/lib/db";
import { rateLimit } from "../../../src/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET() {
  const rate = rateLimit("dashboard", 30, 60000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const [
    companiesCount,
    contactsCount,
    dealsCount,
    openDeals,
    wonDeals,
    lostDeals,
    tasksOpen,
    tasksDone,
    activitiesRecent,
    outreachSent,
    topDeals,
    upcomingTasks,
    recentActivities
  ] = await Promise.all([
    prisma.company.count({ where: { deletedAt: null } }),
    prisma.contact.count({ where: { deletedAt: null } }),
    prisma.deal.count({ where: { deletedAt: null } }),
    prisma.deal.count({
      where: {
        deletedAt: null,
        stage: { notIn: ["CLOSED_WON", "CLOSED_LOST", "DELIVERY_COMPLETE"] }
      }
    }),
    prisma.deal.count({ where: { deletedAt: null, stage: "CLOSED_WON" } }),
    prisma.deal.count({ where: { deletedAt: null, stage: "CLOSED_LOST" } }),
    prisma.task.count({ where: { deletedAt: null, status: { in: ["TODO", "DOING"] } } }),
    prisma.task.count({ where: { deletedAt: null, status: "DONE" } }),
    prisma.activity.count({
      where: {
        deletedAt: null,
        occurredAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }
    }),
    prisma.outreachLog.count({ where: { deletedAt: null, status: "SENT" } }),
    prisma.deal.findMany({
      where: {
        deletedAt: null,
        stage: { notIn: ["CLOSED_WON", "CLOSED_LOST", "DELIVERY_COMPLETE"] }
      },
      include: {
        company: { select: { name: true } },
        primaryContact: { select: { name: true } }
      },
      orderBy: { momentumScore: "desc" },
      take: 5
    }),
    prisma.task.findMany({
      where: { deletedAt: null, status: { in: ["TODO", "DOING"] } },
      include: {
        company: { select: { name: true } },
        deal: { select: { title: true } }
      },
      orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
      take: 10
    }),
    prisma.activity.findMany({
      where: { deletedAt: null },
      include: {
        company: { select: { name: true } },
        contact: { select: { name: true } }
      },
      orderBy: { occurredAt: "desc" },
      take: 10
    })
  ]);

  const totalDealValue = await prisma.deal.aggregate({
    where: {
      deletedAt: null,
      stage: { notIn: ["CLOSED_LOST"] },
      value: { not: null }
    },
    _sum: { value: true }
  });

  return NextResponse.json({
    stats: {
      companies: companiesCount,
      contacts: contactsCount,
      deals: dealsCount,
      openDeals,
      wonDeals,
      lostDeals,
      tasksOpen,
      tasksDone,
      activitiesThisWeek: activitiesRecent,
      outreachSent,
      pipelineValue: totalDealValue._sum.value ?? 0
    },
    topDeals,
    upcomingTasks,
    recentActivities
  });
}
