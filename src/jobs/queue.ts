export type JobType = "NOTE_PROCESS";

export type NoteProcessPayload = {
  noteId: string;
  rawText: string;
};

export type JobPayload = NoteProcessPayload;

export type JobHandler = (payload: JobPayload) => Promise<void>;

const handlers = new Map<JobType, JobHandler>();

export const registerJobHandler = (type: JobType, handler: JobHandler) => {
  handlers.set(type, handler);
};

export const enqueueJob = async (type: JobType, payload: JobPayload) => {
  const handler = handlers.get(type);
  if (!handler) {
    throw new Error(`No handler registered for ${type}.`);
  }
  await handler(payload);
};
