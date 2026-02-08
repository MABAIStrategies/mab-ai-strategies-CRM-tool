import "server-only";

import { ActivityType, DealStage, TaskStatus } from "@prisma/client";
import { prisma } from "./db";

const DEFAULT_LIMIT = 3;

export type TodayTaskItem = {
  id: string;
  title: string;
  dueAt: Date | null;
  status: TaskStatus;
  companyName: string;
  dealStage: DealStage | null;
};

export type TodayActivityItem = {
  id: string;
  occurredAt: Date;
  type: ActivityType;
  durationMinutes: number | null;
  contactName: string | null;
  companyName: string;
};

export type TodayDealItem = {
  id: string;
  companyName: string;
  stage: DealStage;
  momentumScore: number;
};

export type WorkspaceDealSnapshot = {
  id: string;
  companyName: string;
  stage: DealStage;
  momentumScore: number;
  nextStepDate: Date | null;
};

export type WorkspaceActivityItem = {
  id: string;
  type: ActivityType;
  occurredAt: Date;
  durationMinutes: number | null;
  outcome: string | null;
  contactName: string | null;
};

export type WorkspaceTaskItem = {
  id: string;
  title: string;
  dueAt: Date | null;
  status: TaskStatus;
};

export type WorkspaceAssetItem = {
  id: string;
  title: string;
  version: string;
  status: string;
};

export async function getTodayDashboardData() {
  const [tasks, activities, deals] = await Promise.all([
    prisma.task.findMany({
      where: {
        deletedAt: null,
        status: { in: [TaskStatus.TODO, TaskStatus.DOING] }
      },
      orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
      include: { company: true, deal: { include: { company: true } } },
      take: DEFAULT_LIMIT
    }),
    prisma.activity.findMany({
      where: {
        deletedAt: null,
        type: { in: [ActivityType.CALL, ActivityType.MEETING] },
        occurredAt: { gte: new Date() }
      },
      orderBy: { occurredAt: "asc" },
      include: { contact: true, company: true },
      take: DEFAULT_LIMIT
    }),
    prisma.deal.findMany({
      where: { deletedAt: null },
      orderBy: { momentumScore: "desc" },
      include: { company: true },
      take: DEFAULT_LIMIT
    })
  ]);

  const priorityTasks: TodayTaskItem[] = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    dueAt: task.dueAt,
    status: task.status,
    companyName: task.company?.name ?? task.deal?.company?.name ?? "Unassigned",
    dealStage: task.deal?.stage ?? null
  }));

  const upcomingActivities: TodayActivityItem[] = activities.map((activity) => ({
    id: activity.id,
    occurredAt: activity.occurredAt,
    type: activity.type,
    durationMinutes: activity.durationMinutes,
    contactName: activity.contact?.name ?? null,
    companyName: activity.company?.name ?? "Unassigned"
  }));

  const topDeals: TodayDealItem[] = deals.map((deal) => ({
    id: deal.id,
    companyName: deal.company?.name ?? "Untitled deal",
    stage: deal.stage,
    momentumScore: deal.momentumScore
  }));

  return { priorityTasks, upcomingActivities, topDeals };
}

export async function getWorkspaceSnapshot() {
  const focusDeal = await prisma.deal.findFirst({
    where: { deletedAt: null },
    orderBy: { momentumScore: "desc" },
    include: { company: true }
  });

  const focusDealId = focusDeal?.id;

  const [activities, tasks, assets] = await Promise.all([
    focusDealId
      ? prisma.activity.findMany({
          where: { deletedAt: null, dealId: focusDealId },
          orderBy: { occurredAt: "desc" },
          include: { contact: true },
          take: DEFAULT_LIMIT
        })
      : Promise.resolve([]),
    focusDealId
      ? prisma.task.findMany({
          where: {
            deletedAt: null,
            dealId: focusDealId,
            status: { in: [TaskStatus.TODO, TaskStatus.DOING] }
          },
          orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
          take: DEFAULT_LIMIT
        })
      : Promise.resolve([]),
    prisma.asset.findMany({
      where: { deletedAt: null },
      orderBy: { updatedAt: "desc" },
      take: DEFAULT_LIMIT
    })
  ]);

  const focusDealSnapshot: WorkspaceDealSnapshot | null = focusDeal
    ? {
        id: focusDeal.id,
        companyName: focusDeal.company?.name ?? "Pipeline account",
        stage: focusDeal.stage,
        momentumScore: focusDeal.momentumScore,
        nextStepDate: focusDeal.nextStepDate
      }
    : null;

  const timeline: WorkspaceActivityItem[] = activities.map((activity) => ({
    id: activity.id,
    type: activity.type,
    occurredAt: activity.occurredAt,
    durationMinutes: activity.durationMinutes,
    outcome: activity.outcome,
    contactName: activity.contact?.name ?? null
  }));

  const dealTasks: WorkspaceTaskItem[] = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    dueAt: task.dueAt,
    status: task.status
  }));

  const recommendedAssets: WorkspaceAssetItem[] = assets.map((asset) => ({
    id: asset.id,
    title: asset.title,
    version: asset.version,
    status: asset.status
  }));

  return { focusDeal: focusDealSnapshot, timeline, tasks: dealTasks, assets: recommendedAssets };
}
