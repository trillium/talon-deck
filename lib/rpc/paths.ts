import fs from "node:fs";
import os from "node:os";
import path from "node:path";

function getCommunicationDir(): string {
  const uid = process.getuid?.();
  const suffix = uid != null ? `-${uid}` : "";
  return path.join(os.tmpdir(), `talon-deck${suffix}`);
}

const communicationDir = getCommunicationDir();

export const statePath = path.join(communicationDir, "state.json");
export const heartbeatPath = path.join(communicationDir, "heartbeat");
export const requestsDir = path.join(communicationDir, "requests");
export const responsesDir = path.join(communicationDir, "responses");

export function ensureDirs(): void {
  fs.mkdirSync(requestsDir, { recursive: true });
  fs.mkdirSync(responsesDir, { recursive: true });
}
