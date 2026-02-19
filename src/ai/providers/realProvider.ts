import type {
  AIProvider,
  DraftFollowUpInput,
  EmbedInput,
  ExtractInput,
  StructuredExtract,
  SummarizeInput
} from "../provider.js";

const resolveEndpoint = (): string => {
  const endpoint = process.env.AI_PROVIDER_ENDPOINT;
  if (!endpoint) {
    throw new Error("AI_PROVIDER_ENDPOINT is not set for the real provider.");
  }
  return endpoint.replace(/\/$/, "");
};

const resolveHeaders = () => {
  const apiKey = process.env.AI_PROVIDER_API_KEY;
  return {
    "Content-Type": "application/json",
    ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {})
  };
};

const postJson = async <TResponse>(path: string, body: unknown): Promise<TResponse> => {
  const endpoint = resolveEndpoint();
  const response = await fetch(`${endpoint}${path}`, {
    method: "POST",
    headers: resolveHeaders(),
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`AI provider error (${response.status}): ${detail}`);
  }

  return (await response.json()) as TResponse;
};

export const realProvider: AIProvider = {
  async summarize(input: SummarizeInput) {
    const response = await postJson<{ summary: string }>("/summarize", input);
    return response.summary;
  },
  async extract(input: ExtractInput): Promise<StructuredExtract> {
    const response = await postJson<{ structured: StructuredExtract }>("/extract", input);
    return response.structured;
  },
  async embed(input: EmbedInput) {
    const response = await postJson<{ embedding: number[] }>("/embed", input);
    return response.embedding;
  },
  async draftFollowUp(input: DraftFollowUpInput) {
    const response = await postJson<{ draft: string }>("/draft-follow-up", input);
    return response.draft;
  }
};
