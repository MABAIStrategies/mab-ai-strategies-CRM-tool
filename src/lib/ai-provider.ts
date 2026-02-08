import { z } from "zod";
import { structuredExtractSchema } from "./extract";

const DEFAULT_RATE_LIMIT = 30;
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_BACKOFF_MS = 1000;
const DEFAULT_COST_PER_1K = 0.002;
const DEFAULT_OPENAI_BASE_URL = "https://api.openai.com";

type RateLimitState = {
  windowStart: number;
  count: number;
};

type ProviderUsageMetrics = {
  provider: string;
  requests: number;
  tokens: number;
  cost: number;
  operations: Record<string, number>;
  model?: string;
};

const rateLimitState: RateLimitState = {
  windowStart: Date.now(),
  count: 0
};

const providerUsageState: ProviderUsageMetrics = {
  provider: "mock",
  requests: 0,
  tokens: 0,
  cost: 0,
  operations: {}
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

type OpenAIConfig = {
  apiKey: string;
  model: string;
  embeddingModel: string;
  baseUrl: string;
};

const openAIEnvSchema = z.object({
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_MODEL: z.string().min(1),
  OPENAI_EMBEDDING_MODEL: z.string().min(1),
  OPENAI_BASE_URL: z.string().url().optional()
});

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
  return cost;
}

function recordUsage({
  tokens,
  cost,
  operation,
  model
}: {
  tokens: number;
  cost: number;
  operation?: string;
  model?: string;
}) {
  providerUsageState.requests += 1;
  providerUsageState.tokens += tokens;
  providerUsageState.cost += cost;
  if (operation) {
    providerUsageState.operations[operation] =
      (providerUsageState.operations[operation] ?? 0) + 1;
  }
  if (model) {
    providerUsageState.model = model;
  }
}

function setProviderName(provider: string) {
  providerUsageState.provider = provider;
}

export function getProviderUsageMetrics(): ProviderUsageMetrics {
  return {
    provider: providerUsageState.provider,
    requests: providerUsageState.requests,
    tokens: providerUsageState.tokens,
    cost: providerUsageState.cost,
    operations: { ...providerUsageState.operations },
    model: providerUsageState.model
  };
}

export const mockProvider: AIProvider = {
  summarize: async (text) =>
    withRetry(async () => {
      const tokens = estimateTokens(text);
      const cost = trackCost(tokens);
      recordUsage({ tokens, cost, operation: "summarize", model: "mock" });
      return `Summary: ${text.slice(0, 120)}...`;
    }),
  extract: async () =>
    withRetry(async () => {
      const tokens = estimateTokens("mock");
      const cost = trackCost(tokens);
      recordUsage({ tokens, cost, operation: "extract", model: "mock" });
      return {
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
      };
    }),
  embed: async (text) =>
    withRetry(async () => {
      const tokens = estimateTokens(text);
      const cost = trackCost(tokens);
      recordUsage({ tokens, cost, operation: "embed", model: "mock" });
      return Array.from({ length: 8 }, () => Math.random());
    }),
  draftFollowUp: async () =>
    withRetry(async () => {
      const tokens = estimateTokens("mock");
      const cost = trackCost(tokens);
      recordUsage({ tokens, cost, operation: "draftFollowUp", model: "mock" });
      return "Draft follow-up email: ...";
    })
};

function parseJsonPayload(content: string) {
  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
  }
  throw new Error("Unable to parse JSON response");
}

async function openAIChatRequest(
  config: OpenAIConfig,
  payload: Record<string, unknown>
): Promise<{ content: string; tokens: number }> {
  const response = await fetch(`${config.baseUrl}/v1/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
    usage?: { total_tokens?: number };
  };
  const content = data.choices?.[0]?.message?.content ?? "";
  const tokens = data.usage?.total_tokens ?? estimateTokens(content);

  return { content, tokens };
}

function createOpenAIProvider(config: OpenAIConfig): AIProvider {
  const model = config.model;
  return {
    summarize: async (text) =>
      withRetry(async () => {
        const { content, tokens } = await openAIChatRequest(config, {
          model,
          messages: [
            { role: "system", content: "Summarize the note in 3-5 sentences." },
            { role: "user", content: text }
          ],
          temperature: 0.2
        });
        const cost = trackCost(tokens);
        recordUsage({ tokens, cost, operation: "summarize", model });
        return content.trim();
      }),
    extract: async (text) =>
      withRetry(async () => {
        const { content, tokens } = await openAIChatRequest(config, {
          model,
          messages: [
            {
              role: "system",
              content:
                "Extract structured CRM insights. Respond ONLY with valid JSON matching keys: painPoints, currentProcess, systemsMentioned, urgencySignals, budgetSignals, decisionProcess, stakeholders, objections, roiHooks, risks, nextSteps, suggestedTasks (array of {title, description}), followUpEmailDraft, recommendation ({recommendedNextStep, recommendedAssetId, recommendedOfferType})."
            },
            { role: "user", content: text }
          ],
          temperature: 0.1,
          response_format: { type: "json_object" }
        });
        const cost = trackCost(tokens);
        recordUsage({ tokens, cost, operation: "extract", model });
        return structuredExtractSchema.parse(parseJsonPayload(content));
      }),
    embed: async (text) =>
      withRetry(async () => {
        const response = await fetch(`${config.baseUrl}/v1/embeddings`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: config.embeddingModel,
            input: text
          })
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`OpenAI embeddings failed: ${response.status} ${errorText}`);
        }
        const data = (await response.json()) as {
          data?: { embedding?: number[] }[];
        };
        const embedding = data.data?.[0]?.embedding ?? [];
        const tokens = estimateTokens(text);
        const cost = trackCost(tokens);
        recordUsage({ tokens, cost, operation: "embed", model: config.embeddingModel });
        return embedding;
      }),
    draftFollowUp: async ({ extract, dealContext }) =>
      withRetry(async () => {
        const { content, tokens } = await openAIChatRequest(config, {
          model,
          messages: [
            {
              role: "system",
              content:
                "Draft a concise, professional follow-up email for a sales rep. Keep it under 200 words and include a clear next step."
            },
            {
              role: "user",
              content: `Deal context: ${dealContext ?? "Not provided"}\nExtract: ${JSON.stringify(
                extract
              )}`
            }
          ],
          temperature: 0.3
        });
        const cost = trackCost(tokens);
        recordUsage({ tokens, cost, operation: "draftFollowUp", model });
        return content.trim();
      })
  };
}

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

function loadOpenAIConfig(): OpenAIConfig | null {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }
  const parsed = openAIEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    logValidationError(parsed.error, "OPENAI_ENV");
    return null;
  }
  return {
    apiKey: parsed.data.OPENAI_API_KEY,
    model: parsed.data.OPENAI_MODEL,
    embeddingModel: parsed.data.OPENAI_EMBEDDING_MODEL,
    baseUrl: parsed.data.OPENAI_BASE_URL ?? DEFAULT_OPENAI_BASE_URL
  };
}

export function getAIProvider(): AIProvider {
  const openAIConfig = loadOpenAIConfig();
  if (openAIConfig) {
    setProviderName("openai");
    return createOpenAIProvider(openAIConfig);
  }
  setProviderName("mock");
  return mockProvider;
}
