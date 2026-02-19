import type { MemoryItem, Note } from "./models.js";

const notes = new Map<string, Note>();
const memoryItems = new Map<string, MemoryItem>();

const buildId = () => crypto.randomUUID();

export const noteStore = {
  create(input: Omit<Note, "id" | "createdAt" | "updatedAt">): Note {
    const now = new Date();
    const note: Note = {
      id: buildId(),
      createdAt: now,
      updatedAt: now,
      ...input
    };
    notes.set(note.id, note);
    return note;
  },
  update(noteId: string, updates: Partial<Omit<Note, "id" | "createdAt">>): Note {
    const existing = notes.get(noteId);
    if (!existing) {
      throw new Error(`Note ${noteId} not found.`);
    }
    const updated: Note = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };
    notes.set(noteId, updated);
    return updated;
  },
  get(noteId: string): Note | undefined {
    return notes.get(noteId);
  }
};

export const memoryItemStore = {
  create(input: Omit<MemoryItem, "id" | "createdAt">): MemoryItem {
    const memoryItem: MemoryItem = {
      id: buildId(),
      createdAt: new Date(),
      ...input
    };
    memoryItems.set(memoryItem.id, memoryItem);
    return memoryItem;
  },
  listByNote(noteId: string): MemoryItem[] {
    return Array.from(memoryItems.values()).filter((item) => item.noteId === noteId);
  }
};
