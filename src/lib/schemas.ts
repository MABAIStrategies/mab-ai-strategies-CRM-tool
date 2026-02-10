import { z } from "zod";

export const commandSchema = z
  .string()
  .min(3, "Command needs at least 3 characters")
  .max(120, "Command too long")
  .trim();

export type CommandInput = z.infer<typeof commandSchema>;
