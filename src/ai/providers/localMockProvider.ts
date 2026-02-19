import type {
  AIProvider,
  DraftFollowUpInput,
  EmbedInput,
  ExtractInput,
  StructuredExtract,
  SummarizeInput
} from "../provider.js";

const buildSummary = (input: SummarizeInput): string => {
  const trimmed = input.text.trim();
  if (!trimmed) return "";
  const words = trimmed.split(/\s+/);
  const maxWords = input.maxWords ?? 40;
  return words.slice(0, maxWords).join(" ") + (words.length > maxWords ? "…" : "");
};

const buildStructuredExtract = (input: ExtractInput): StructuredExtract => {
  const summary = buildSummary({ text: input.text, maxWords: 24 });
  return {
    note: {
      title: summary ? `Call Notes: ${summary}` : "Call Notes",
      body: input.text.trim() || "No notes captured.",
      tags: ["mock", "local"]
    },
    memoryItems: [
      {
        content: summary || "Capture key outcomes from the call.",
        kind: "insight",
        importance: 0.6
      }
    ],
    followUpDraft: summary
      ? `Thanks again for the conversation. Key takeaway: ${summary}. Let me know the best next step.`
      : "Thanks for the time today—what would you like to tackle next?"
  };
};

const buildEmbedding = (input: EmbedInput): number[] => {
  const dimensions = input.dimensions ?? 8;
  return Array.from({ length: dimensions }, (_, index) =>
    Math.sin(index + input.text.length)
  );
};

const buildFollowUp = (input: DraftFollowUpInput): string => {
  const base = input.text.trim();
  const tonePrefix =
    input.tone === "formal"
      ? "Following up on our discussion,"
      : input.tone === "direct"
      ? "Quick follow-up:"
      : "Appreciate your time—";
  return `${tonePrefix} ${base || "here is a recap and next step."}`.trim();
};

export const localMockProvider: AIProvider = {
  async summarize(input) {
    return buildSummary(input);
  },
  async extract(input) {
    return buildStructuredExtract(input);
  },
  async embed(input) {
    return buildEmbedding(input);
  },
  async draftFollowUp(input) {
    return buildFollowUp(input);
  }
};
