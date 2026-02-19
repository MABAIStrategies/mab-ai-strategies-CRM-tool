export type SummarizeInput = {
  text: string;
  maxWords?: number;
};

export type ExtractInput = {
  text: string;
};

export type EmbedInput = {
  text: string;
  dimensions?: number;
};

export type DraftFollowUpInput = {
  text: string;
  tone?: "warm" | "direct" | "formal";
};

export type StructuredExtract = {
  note: {
    title?: string;
    body: string;
    tags: string[];
  };
  memoryItems: Array<{
    content: string;
    kind: "insight" | "task" | "fact";
    importance: number;
  }>;
  followUpDraft?: string;
};

export interface AIProvider {
  summarize(input: SummarizeInput): Promise<string>;
  extract(input: ExtractInput): Promise<StructuredExtract>;
  embed(input: EmbedInput): Promise<number[]>;
  draftFollowUp(input: DraftFollowUpInput): Promise<string>;
}
