import { prisma } from "./db";
import type { Prisma } from "@prisma/client";

export type JobPayload = Record<string, unknown>;

export function buildIdempotencyKey(type: string, sourceId: string) {
  return `${type.toLowerCase()}-${sourceId}`;
}

export async function enqueueJob({
  type,
  payload,
  idempotencyKey,
  runAt = new Date()
}: {
  type: string;
  payload: JobPayload;
  idempotencyKey: string;
  runAt?: Date;
}) {
  return prisma.job.upsert({
    where: { idempotencyKey },
    update: {},
    create: {
      type,
      payload: payload as Prisma.InputJsonValue,
      idempotencyKey,
      runAt
    }
  });
}

export async function claimNextJob() {
  return prisma.$transaction(async (tx) => {
    const job = await tx.job.findFirst({
      where: { status: "QUEUED", runAt: { lte: new Date() } },
      orderBy: { createdAt: "asc" }
    });

    if (!job) {
      return null;
    }

    return tx.job.update({
      where: { id: job.id },
      data: { status: "RUNNING", attempts: { increment: 1 } }
    });
  });
}

export async function updateJobStatus({
  jobId,
  status,
  lastError,
  runAt
}: {
  jobId: string;
  status: "SUCCEEDED" | "FAILED" | "QUEUED";
  lastError?: string;
  runAt?: Date;
}) {
  return prisma.job.update({
    where: { id: jobId },
    data: {
      status,
      lastError,
      runAt
    }
  });
}
