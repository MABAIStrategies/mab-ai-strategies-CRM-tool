import { z } from "zod";
import { structuredExtractSchema } from "./extract";

const DEFAULT_RATE_LIMIT = 30;
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_BACKOFF_MS = 1000;
const DEFAULT_COST_PER_1K = 0.002;

type RateLimitState = {
  windowStart: number;
  count: number;
};

const rateLimitState: RateLimitState = {
  windowStart: Date.now(),
  count: 0
};

export type StructuredExtract = z.infer<typeof structuredExtractSchema>;

export type AIProvider = {
  summarize: (text: string) => Promise<string>;
  extract: (text: string) => Promise<StructuredExtract>;
  embed: (text: string) => Promise<number[]>;
  draftFollowUp: (payload: {
    extract: StructuredExtract;
    dealContext?: string;
  }) => Promise<string>;
};

export function sanitizeInput(text: string) {
  return text.replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim();
}

export function estimateTokens(text: string) {
  return Math.ceil(text.split(/\s+/).length * 1.3);
}

function rateLimitGuard() {
  const limit = Number(process.env.AI_RATE_LIMIT_PER_MINUTE ?? DEFAULT_RATE_LIMIT);
  const now = Date.now();
  const windowMs = 60000;
  if (now - rateLimitState.windowStart > windowMs) {
    rateLimitState.windowStart = now;
    rateLimitState.count = 0;
  }
  rateLimitState.count += 1;
  if (rateLimitState.count > limit) {
    throw new Error("AI rate limit exceeded");
  }
}

async function withRetry<T>(fn: () => Promise<T>) {
  const maxRetries = Number(process.env.AI_MAX_RETRIES ?? DEFAULT_MAX_RETRIES);
  const baseBackoff = Number(process.env.AI_BACKOFF_MS ?? DEFAULT_BACKOFF_MS);
  let attempt = 0;
  while (true) {
    try {
      rateLimitGuard();
      return await fn();
    } catch (error) {
      attempt += 1;
      if (attempt > maxRetries) {
        throw error;
      }
      const delay = baseBackoff * 2 ** (attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

function trackCost(tokens: number) {
  const costPer1K = Number(process.env.AI_COST_PER_1K_TOKENS ?? DEFAULT_COST_PER_1K);
  const cost = (tokens / 1000) * costPer1K;
  console.log(
    JSON.stringify({
      level: "info",
      message: "AI cost estimate",
      tokens,
      cost
    })
  );
}

export const mockProvider: AIProvider = {
  summarize: async (text) =>
    withRetry(async () => {
      trackCost(estimateTokens(text));
      return `Summary: ${text.slice(0, 120)}...`;
    }),
  extract: async () =>
    withRetry(async () => ({
      painPoints: ["Manual compliance workflows"],
      currentProcess: "Manual reporting and spreadsheet tracking",
      systemsMentioned: ["Salesforce"],
      urgencySignals: ["Executive mandate"],
      budgetSignals: ["Budget already allocated"],
      decisionProcess: "CFO + VP Ops approval",
      stakeholders: ["CFO", "VP Ops"],
      objections: ["Data residency"],
      roiHooks: ["Automated compliance reporting"],
      risks: ["Change management"],
      nextSteps: ["Schedule technical workshop"],
      suggestedTasks: [
        {
          title: "Send ROI calculator",
          description: "Attach latest ROI calculator to follow-up email"
        }
      ],
      followUpEmailDraft: "Sharing the ROI snapshot and next-step options...",
      recommendation: {
        recommendedNextStep: "Send ROI snapshot and confirm workshop",
        recommendedOfferType: "IMPLEMENTATION"
      }
    })),
  embed: async (text) =>
    withRetry(async () => {
      trackCost(estimateTokens(text));
      return Array.from({ length: 8 }, () => Math.random());
    }),
  draftFollowUp: async () =>
    withRetry(async () => "Draft follow-up email: ...")
};

export function logValidationError(error: unknown, context: string) {
  if (error instanceof z.ZodError) {
    console.error(
      JSON.stringify({
        level: "error",
        message: "Validation error",
        context,
        issues: error.issues
      })
    );
    return;
  }
  console.error(
    JSON.stringify({
      level: "error",
      message: "Unknown validation error",
      context
    })
  );
}
export function getAIProvider(): AIProvider {
  return mockProvider;
}
