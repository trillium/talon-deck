import fs from "node:fs";
import path from "node:path";
import { getAction } from "./config";
import { requestsDir, responsesDir } from "./rpc/paths";
import type { ActionResponse } from "./rpc/types";

const ACTION_TIMEOUT_MS = 3000;

export async function performAction(actionId: string): Promise<void> {
  const action = getAction(actionId);
  const uuid = crypto.randomUUID();

  const request = { uuid, action, timestamp: Date.now() };
  const requestPath = path.join(requestsDir, `${uuid}.json`);
  const tmpPath = `${requestPath}.tmp`;

  // Write request atomically
  fs.writeFileSync(tmpPath, JSON.stringify(request));
  fs.renameSync(tmpPath, requestPath);

  // Poll for response
  const response = await pollForResponse(uuid);

  // Clean up response file
  try {
    fs.unlinkSync(path.join(responsesDir, `${uuid}.json`));
  } catch {}

  if (response.error) {
    throw new Error(response.error);
  }
}

async function pollForResponse(uuid: string): Promise<ActionResponse> {
  const responsePath = path.join(responsesDir, `${uuid}.json`);
  const deadline = Date.now() + ACTION_TIMEOUT_MS;
  let sleepMs = 1;

  while (Date.now() < deadline) {
    try {
      const content = fs.readFileSync(responsePath, "utf-8");
      if (content.endsWith("\n")) {
        return JSON.parse(content);
      }
    } catch {
      // File doesn't exist yet
    }

    await Bun.sleep(sleepMs);
    sleepMs = Math.min(sleepMs * 2, Math.max(deadline - Date.now(), 1), 100);
  }

  // Timeout — clean up stale request
  try {
    fs.unlinkSync(path.join(requestsDir, `${uuid}.json`));
  } catch {}

  throw new Error("Action timed out waiting for Talon response");
}
