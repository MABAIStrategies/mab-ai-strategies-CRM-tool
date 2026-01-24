import { z } from "zod";

export const structuredExtractSchema = z.object({
  painPoints: z.array(z.string()).default([]),
  currentProcess: z.string().optional(),
  systemsMentioned: z.array(z.string()).default([]),
  urgencySignals: z.array(z.string()).default([]),
  budgetSignals: z.array(z.string()).default([]),
  decisionProcess: z.string().optional(),
  stakeholders: z.array(z.string()).default([]),
  objections: z.array(z.string()).default([]),
  roiHooks: z.array(z.string()).default([]),
  risks: z.array(z.string()).default([]),
  nextSteps: z.array(z.string()).default([]),
  suggestedTasks: z
    .array(
      z.object({
        title: z.string(),
        description: z.string().optional()
      })
    )
    .default([]),
  followUpEmailDraft: z.string().optional(),
  recommendation: z
    .object({
      recommendedNextStep: z.string(),
      recommendedAssetId: z.string().optional(),
      recommendedOfferType: z.string().optional()
    })
    .optional()
});
