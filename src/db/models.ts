export type Note = {
  id: string;
  title?: string;
  body: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type MemoryItem = {
  id: string;
  noteId: string;
  content: string;
  kind: "insight" | "task" | "fact";
  importance: number;
  embedding: number[];
  createdAt: Date;
};
