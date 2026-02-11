import { resolveAIProvider } from "../ai/index.js";
import { validateStructuredExtract } from "../ai/structuredExtract.js";
import { memoryItemStore, noteStore } from "../db/store.js";
import type { NoteProcessPayload } from "./queue.js";

export const handleNoteProcess = async (payload: NoteProcessPayload) => {
  const provider = resolveAIProvider();
  const structured = await provider.extract({ text: payload.rawText });
  const validated = validateStructuredExtract(structured);

  noteStore.update(payload.noteId, {
    title: validated.note.title,
    body: validated.note.body,
    tags: validated.note.tags
  });

  for (const item of validated.memoryItems) {
    const embedding = await provider.embed({ text: item.content, dimensions: 8 });
    memoryItemStore.create({
      noteId: payload.noteId,
      content: item.content,
      kind: item.kind,
      importance: item.importance,
      embedding
    });
  }
};
