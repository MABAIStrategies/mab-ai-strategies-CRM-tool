import { handleNoteProcess } from "./noteProcess.js";
import { registerJobHandler } from "./queue.js";

export const registerJobs = () => {
  registerJobHandler("NOTE_PROCESS", handleNoteProcess);
};
