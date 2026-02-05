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
  chat: (messages: { role: string; content: string }[]) => Promise<string>;
  generateProposal: (context: {
    companyName: string;
    dealContext: string;
    offerType: string;
    painPoints: string[];
    roiDrivers: string[];
  }) => Promise<string>;
  enrichCompany: (domain: string) => Promise<{
    description?: string;
    industry?: string;
    employeeCount?: string;
    techStack?: string[];
  }>;
  composeOutreach: (context: {
    contactName: string;
    companyName: string;
    painPoints: string[];
    offerType: string;
    sequenceStep: number;
  }) => Promise<{ subject: string; body: string }>;
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
    JSON.stringify({ level: "info", message: "AI cost estimate", tokens, cost })
  );
}

async function callOpenAI(
  messages: { role: string; content: string }[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("NO_API_KEY");
  }
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2000
    })
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI error: ${response.status} ${err}`);
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "";
}

function hasOpenAI(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

export const mockProvider: AIProvider = {
  summarize: async (text) =>
    withRetry(async () => {
      trackCost(estimateTokens(text));
      return `Summary: ${text.slice(0, 200)}...`;
    }),
  extract: async (text) =>
    withRetry(async () => {
      trackCost(estimateTokens(text));
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
        followUpEmailDraft:
          "Hi — sharing the ROI snapshot and next-step options. Let me know if Thursday works for the technical workshop.",
        recommendation: {
          recommendedNextStep: "Send ROI snapshot and confirm workshop",
          recommendedOfferType: "IMPLEMENTATION"
        }
      };
    }),
  embed: async (text) =>
    withRetry(async () => {
      trackCost(estimateTokens(text));
      return Array.from({ length: 8 }, () => Math.random());
    }),
  draftFollowUp: async ({ extract, dealContext }) =>
    withRetry(async () => {
      const pain = extract.painPoints?.join(", ") ?? "process efficiency";
      return `Hi,\n\nFollowing up on our conversation about ${pain}. ${dealContext ? `Regarding ${dealContext}, ` : ""}I wanted to share some next steps:\n\n1. ROI analysis based on your current process\n2. Technical workshop to map integration points\n3. Stakeholder alignment meeting\n\nWould any of these work for next week?\n\nBest regards`;
    }),
  chat: async (messages) =>
    withRetry(async () => {
      const last = messages[messages.length - 1]?.content ?? "";
      return `Based on your CRM data, here are my insights:\n\n${last.includes("deal") ? "Focus on advancing deals with momentum > 70. Prioritize discovery calls and ROI documentation." : "I recommend focusing on high-priority tasks and following up with contacts who have recent engagement signals."}`;
    }),
  generateProposal: async ({ companyName, offerType, painPoints, roiDrivers }) =>
    withRetry(async () => {
      return `# Proposal for ${companyName}\n\n## Executive Summary\nWe propose a tailored ${offerType.toLowerCase()} engagement to address your key challenges.\n\n## Challenges Identified\n${painPoints.map((p) => `- ${p}`).join("\n")}\n\n## Proposed Solution\nOur ${offerType.toLowerCase()} program delivers measurable outcomes through AI-driven process automation.\n\n## Expected ROI\n${roiDrivers.map((r) => `- ${r}`).join("\n")}\n\n## Investment\nDetailed pricing will be provided upon scope confirmation.\n\n## Next Steps\n1. Technical discovery workshop\n2. Scope confirmation\n3. Statement of work\n4. Kickoff within 2 weeks of sign-off`;
    }),
  enrichCompany: async (domain) =>
    withRetry(async () => {
      return {
        description: `Company at ${domain}`,
        industry: "Technology",
        employeeCount: "50-200",
        techStack: ["Cloud", "SaaS"]
      };
    }),
  composeOutreach: async ({ contactName, companyName, painPoints, offerType, sequenceStep }) =>
    withRetry(async () => {
      if (sequenceStep === 1) {
        return {
          subject: `${companyName} + MAB AI Strategies — ${offerType} opportunity`,
          body: `Hi ${contactName},\n\nI noticed ${companyName} is working through ${painPoints[0] ?? "process optimization challenges"}. We specialize in helping companies like yours with AI-driven ${offerType.toLowerCase()} solutions.\n\nWould you be open to a 15-minute call this week to explore fit?\n\nBest,\nMAB AI Strategies`
        };
      }
      return {
        subject: `Re: ${companyName} + MAB AI Strategies`,
        body: `Hi ${contactName},\n\nJust following up on my previous note. I'd love to share how we've helped similar companies address ${painPoints[0] ?? "operational challenges"} — typically seeing 30-40% efficiency gains.\n\nHappy to work around your schedule.\n\nBest,\nMAB AI Strategies`
      };
    })
};

const openAIProvider: AIProvider = {
  summarize: async (text) =>
    withRetry(async () => {
      trackCost(estimateTokens(text));
      return callOpenAI([
        {
          role: "system",
          content: "Summarize the following sales note in 2-3 concise sentences. Focus on key decisions, objections, and next steps."
        },
        { role: "user", content: text }
      ]);
    }),
  extract: async (text) =>
    withRetry(async () => {
      trackCost(estimateTokens(text));
      const result = await callOpenAI(
        [
          {
            role: "system",
            content: `Extract structured sales intelligence from the following note. Return valid JSON with these fields: painPoints (array), currentProcess (string), systemsMentioned (array), urgencySignals (array), budgetSignals (array), decisionProcess (string), stakeholders (array), objections (array), roiHooks (array), risks (array), nextSteps (array), suggestedTasks (array of {title, description}), followUpEmailDraft (string), recommendation ({recommendedNextStep, recommendedOfferType}).`
          },
          { role: "user", content: text }
        ],
        { temperature: 0.3 }
      );
      try {
        const cleaned = result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        return structuredExtractSchema.parse(JSON.parse(cleaned));
      } catch {
        return mockProvider.extract(text);
      }
    }),
  embed: async (text) =>
    withRetry(async () => {
      trackCost(estimateTokens(text));
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) return Array.from({ length: 8 }, () => Math.random());
      const response = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "text-embedding-3-small",
          input: text
        })
      });
      if (!response.ok) return Array.from({ length: 8 }, () => Math.random());
      const data = await response.json();
      return data.data?.[0]?.embedding ?? Array.from({ length: 8 }, () => Math.random());
    }),
  draftFollowUp: async ({ extract, dealContext }) =>
    withRetry(async () => {
      return callOpenAI([
        {
          role: "system",
          content:
            "Draft a professional follow-up email based on the sales intelligence provided. Be concise, specific, and action-oriented."
        },
        {
          role: "user",
          content: `Pain points: ${extract.painPoints?.join(", ")}\nObjections: ${extract.objections?.join(", ")}\nNext steps: ${extract.nextSteps?.join(", ")}\nDeal context: ${dealContext ?? "N/A"}`
        }
      ]);
    }),
  chat: async (messages) =>
    withRetry(async () => {
      return callOpenAI([
        {
          role: "system",
          content:
            "You are an AI sales assistant for MAB AI Strategies CRM. Help the user with sales strategy, deal analysis, outreach optimization, and CRM insights. Be specific and actionable."
        },
        ...messages.map((m) => ({ role: m.role, content: m.content }))
      ]);
    }),
  generateProposal: async ({ companyName, dealContext, offerType, painPoints, roiDrivers }) =>
    withRetry(async () => {
      return callOpenAI(
        [
          {
            role: "system",
            content:
              "Generate a professional business proposal in markdown format. Include: Executive Summary, Challenges, Proposed Solution, Expected ROI, Investment Range, and Next Steps."
          },
          {
            role: "user",
            content: `Company: ${companyName}\nDeal context: ${dealContext}\nOffer type: ${offerType}\nPain points: ${painPoints.join(", ")}\nROI drivers: ${roiDrivers.join(", ")}`
          }
        ],
        { maxTokens: 3000 }
      );
    }),
  enrichCompany: async (domain) =>
    withRetry(async () => {
      const result = await callOpenAI(
        [
          {
            role: "system",
            content:
              'Given a company domain, provide what you know about the company. Return valid JSON: {"description": "...", "industry": "...", "employeeCount": "...", "techStack": ["..."]}'
          },
          { role: "user", content: `Domain: ${domain}` }
        ],
        { temperature: 0.3 }
      );
      try {
        const cleaned = result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        return JSON.parse(cleaned);
      } catch {
        return { description: `Company at ${domain}` };
      }
    }),
  composeOutreach: async ({ contactName, companyName, painPoints, offerType, sequenceStep }) =>
    withRetry(async () => {
      const result = await callOpenAI(
        [
          {
            role: "system",
            content: `Compose a cold outreach email (step ${sequenceStep} of a sequence). Return valid JSON: {"subject": "...", "body": "..."}. Be concise and personalized. Sign off as MAB AI Strategies.`
          },
          {
            role: "user",
            content: `Contact: ${contactName}\nCompany: ${companyName}\nPain points: ${painPoints.join(", ")}\nOffer: ${offerType}\nSequence step: ${sequenceStep}`
          }
        ],
        { temperature: 0.7 }
      );
      try {
        const cleaned = result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        return JSON.parse(cleaned);
      } catch {
        return mockProvider.composeOutreach({
          contactName,
          companyName,
          painPoints,
          offerType,
          sequenceStep
        });
      }
    })
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
  if (hasOpenAI()) {
    return openAIProvider;
  }
  return mockProvider;
}
