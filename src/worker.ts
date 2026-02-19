import { z } from "zod";
import { prisma } from "./lib/db";
import { claimNextJob, updateJobStatus } from "./lib/queue";
import {
  getAIProvider,
  getProviderUsageMetrics,
  logValidationError,
  sanitizeInput
} from "./lib/ai-provider";
import { structuredExtractSchema } from "./lib/extract";
import { syncMemoryFromAsset, syncMemoryFromNote } from "./lib/memory";

const ai = getAIProvider();

const JOB_DELAY_MS = 3000;
const MAX_ATTEMPTS = 5;
const JOB_TIMEOUT_MS = 45000;
let shouldStop = false;

const jobSchemas = {
  NOTE_PROCESS: z.object({ noteId: z.string() }),
  DEAL_STAGE_CHECKLIST: z.object({
    dealId: z.string(),
    tasks: z.array(
      z.object({
        title: z.string(),
        description: z.string().optional()
      })
    )
  }),
  ASSET_CLASSIFY: z.object({ assetId: z.string() }),
  MEMORY_EMBED: z.object({ memoryItemId: z.string(), text: z.string() }),
  TEMPLATE_GENERATE: z.object({ templateId: z.string(), assetId: z.string().optional() })
};

type JobType = keyof typeof jobSchemas;

const sanitizePayload = (payload: Record<string, unknown>) => {
  const { text, ...rest } = payload;
  return { ...rest, text: text ? "[REDACTED]" : undefined };
};

const logInfo = (message: string, context?: Record<string, unknown>) => {
  console.log(JSON.stringify({ level: "info", message, ...context }));
};

const logError = (message: string, context?: Record<string, unknown>) => {
  console.error(JSON.stringify({ level: "error", message, ...context }));
};

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number) => {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("Job timed out")), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId!);
  }
};

async function handleNoteProcess(payload: Record<string, unknown>) {
  const { noteId } = jobSchemas.NOTE_PROCESS.parse(payload);

  const note = await prisma.note.findUnique({ where: { id: noteId } });
  if (!note) {
    throw new Error(`Note ${noteId} not found`);
  }

  const cleanText = sanitizeInput(note.rawText);
  const summary = await ai.summarize(cleanText);
  let extractResult;
  try {
    extractResult = await ai.extract(cleanText);
  } catch (error) {
    logValidationError(error, "NOTE_PROCESS extract");
    throw error;
  }
  const extract = structuredExtractSchema.parse(extractResult);

  await prisma.$transaction(async (transaction) => {
    await transaction.note.update({
      where: { id: noteId },
      data: { summary, structuredExtract: extract }
    });

    if (extract.suggestedTasks?.length) {
      await transaction.task.createMany({
        data: extract.suggestedTasks.map((task) => ({
          title: task.title,
          description: task.description,
          companyId: note.companyId,
          dealId: note.dealId,
          contactId: note.contactId
        }))
      });
    }
  });

  await syncMemoryFromNote({ note: updatedNote, summary, extract });
}

async function handleDealStageChecklist(payload: Record<string, unknown>) {
  const { dealId, tasks } = jobSchemas.DEAL_STAGE_CHECKLIST.parse(payload);
  await prisma.task.createMany({
    data: tasks.map((task) => ({
      title: task.title,
      description: task.description,
      dealId
    }))
  });
}

async function handleAssetClassify(payload: Record<string, unknown>) {
  const { assetId } = jobSchemas.ASSET_CLASSIFY.parse(payload);
  const asset = await prisma.asset.update({
    where: { id: assetId },
    data: { tags: ["Auto-tagged"], status: "APPROVED" }
  });

  await syncMemoryFromAsset(asset);
}

async function handleMemoryEmbed(payload: Record<string, unknown>) {
  const { memoryItemId, text } = jobSchemas.MEMORY_EMBED.parse(payload);
  const embedding = await ai.embed(sanitizeInput(text));
  await prisma.memoryItem.update({
    where: { id: memoryItemId },
    data: { embedding: Buffer.from(Float32Array.from(embedding).buffer) }
  });
}

async function handleTemplateGenerate(payload: Record<string, unknown>) {
  const { templateId, assetId } = jobSchemas.TEMPLATE_GENERATE.parse(payload);
  const template = await prisma.template.findUnique({ where: { id: templateId } });
  if (!template) {
    throw new Error(`Template ${templateId} not found`);
  }

  const resolvedType =
    template.outputType === "PROPOSAL"
      ? "PROPOSAL"
      : template.outputType === "DOC"
        ? "TEMPLATE"
        : template.outputType === "EMAIL"
          ? "SCRIPT"
          : "OTHER";

  if (assetId) {
    const existingAsset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (existingAsset) {
      await prisma.asset.update({
        where: { id: assetId },
        data: {
          type: resolvedType,
          title: `${template.name} Output`,
          description: template.description ?? "Generated draft ready for review.",
          tags: ["Generated", "Template"],
          version: "1.0",
          status: "DRAFT",
          storageUri: `local://generated/${template.id}`
        }
      });
      return;
    }
  }

  await prisma.asset.create({
    data: {
      type: resolvedType,
      title: `${template.name} Output`,
      description: template.description ?? "Generated draft ready for review.",
      tags: ["Generated", "Template"],
      version: "1.0",
      status: "DRAFT",
      storageUri: `local://generated/${template.id}`
    }
  });
}

const handlers: Record<JobType, (payload: Record<string, unknown>) => Promise<void>> = {
  NOTE_PROCESS: handleNoteProcess,
  DEAL_STAGE_CHECKLIST: handleDealStageChecklist,
  ASSET_CLASSIFY: handleAssetClassify,
  MEMORY_EMBED: handleMemoryEmbed,
  TEMPLATE_GENERATE: handleTemplateGenerate
};

async function runWorker() {
  process.on("SIGTERM", () => {
    shouldStop = true;
    logInfo("SIGTERM received. Finishing current job before shutdown.");
  });

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (shouldStop) {
      logInfo("Worker stopped gracefully.");
      break;
    }

    const job = await claimNextJob();
    if (!job) {
      await new Promise((resolve) => setTimeout(resolve, JOB_DELAY_MS));
      continue;
    }

    const jobStart = Date.now();
    const metricsStart = getProviderUsageMetrics();
    try {
      const handler = handlers[job.type as JobType];
      if (!handler) {
        throw new Error(`Unknown job type ${job.type}`);
      }
      logInfo("Job started", {
        jobId: job.id,
        type: job.type,
        payload: sanitizePayload(job.payload as Record<string, unknown>)
      });
      await withTimeout(handler(job.payload as Record<string, unknown>), JOB_TIMEOUT_MS);
      await updateJobStatus({ jobId: job.id, status: "SUCCEEDED" });
      const metricsEnd = getProviderUsageMetrics();
      logInfo("Job succeeded", {
        jobId: job.id,
        type: job.type,
        durationMs: Date.now() - jobStart,
        providerUsage: {
          provider: metricsEnd.provider,
          model: metricsEnd.model,
          requests: metricsEnd.requests - metricsStart.requests,
          tokens: metricsEnd.tokens - metricsStart.tokens,
          cost: metricsEnd.cost - metricsStart.cost,
          operations: Object.entries(metricsEnd.operations).reduce<Record<string, number>>(
            (acc, [key, value]) => {
              acc[key] = value - (metricsStart.operations[key] ?? 0);
              return acc;
            },
            {}
          )
        }
      });
    } catch (error) {
      const attempts = job.attempts + 1;
      const delay = Math.min(60000, 1000 * 2 ** attempts);
      const runAt = new Date(Date.now() + delay);
      const lastError = (error as Error).message;
      await updateJobStatus({
        jobId: job.id,
        status: attempts >= MAX_ATTEMPTS ? "FAILED" : "QUEUED",
        lastError,
        runAt
      });
      const metricsEnd = getProviderUsageMetrics();
      logError("Job failed", {
        jobId: job.id,
        type: job.type,
        attempts,
        lastError,
        durationMs: Date.now() - jobStart,
        providerUsage: {
          provider: metricsEnd.provider,
          model: metricsEnd.model,
          requests: metricsEnd.requests - metricsStart.requests,
          tokens: metricsEnd.tokens - metricsStart.tokens,
          cost: metricsEnd.cost - metricsStart.cost,
          operations: Object.entries(metricsEnd.operations).reduce<Record<string, number>>(
            (acc, [key, value]) => {
              acc[key] = value - (metricsStart.operations[key] ?? 0);
              return acc;
            },
            {}
          )
        }
      });
    }
  }
}

runWorker().catch((error) => {
  console.error(error);
  process.exit(1);
});
