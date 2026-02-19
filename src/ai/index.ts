import type { AIProvider } from "./provider.js";
import { localMockProvider } from "./providers/localMockProvider.js";
import { realProvider } from "./providers/realProvider.js";

export const resolveAIProvider = (): AIProvider => {
  const mode = process.env.AI_PROVIDER_MODE ?? "local";
  if (mode === "real") {
    return realProvider;
  }
  return localMockProvider;
};
