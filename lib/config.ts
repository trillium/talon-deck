import { EventEmitter } from "node:events";
import fs from "node:fs";
import { ensureDirs, heartbeatPath, statePath } from "./rpc/paths";
import type { StateMessage } from "./rpc/types";
import type { ButtonClient, ButtonConfig } from "./types";

ensureDirs();

const emitter = new EventEmitter();

let currentStateString = "";
let buttons: ButtonClient[] = [];
let idToAction = new Map<string, string>();

export function getButtons() {
  return buttons;
}

export function getAction(actionId: string) {
  const action = idToAction.get(actionId);
  if (!action) {
    throw Error(`Unknown actionId: '${actionId}'`);
  }
  return action;
}

export function onUpdate(listener: () => void) {
  emitter.on("update", listener);
  return () => {
    emitter.off("update", listener);
  };
}

function readState(): boolean {
  try {
    const content = fs.readFileSync(statePath, "utf-8");
    if (content !== currentStateString) {
      const state: StateMessage = JSON.parse(content);
      sortButtons(state.buttons);
      const [actionToId, newIdToAction] = createActionMaps(state.buttons);
      buttons = state.buttons.map((b) => createClientButton(actionToId, b));
      idToAction = newIdToAction;
      currentStateString = content;
      return true;
    }
  } catch {}
  return false;
}

function isStale(): boolean {
  if (!currentStateString) return false;
  try {
    const stat = fs.statSync(heartbeatPath);
    return Date.now() - stat.mtimeMs > 3000;
  } catch {
    return true;
  }
}

function reset() {
  currentStateString = "";
  buttons = [];
  idToAction = new Map();
}

// Watch state file for changes. Retry if file doesn't exist yet.
function startWatching() {
  try {
    fs.watch(statePath, () => {
      if (readState()) {
        emitter.emit("update");
      }
    });
  } catch {
    setTimeout(startWatching, 1000);
  }
}

startWatching();

// Check for staleness periodically
setInterval(() => {
  if (isStale()) {
    reset();
    emitter.emit("update");
  }
}, 1000);

function createClientButton(actionToId: Map<string, string>, button: ButtonConfig): ButtonClient {
  return {
    icon: button.icon,
    actionId: button.action ? actionToId.get(button.action) : undefined,
  };
}

function sortButtons(buttons: ButtonConfig[]) {
  buttons.sort(
    (a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER),
  );
}

function createActionMaps(buttons: ButtonConfig[]) {
  const actionToId = new Map<string, string>();
  const newIdToAction = new Map<string, string>();
  for (const button of buttons) {
    if (button.action) {
      const id = crypto.randomUUID();
      actionToId.set(button.action, id);
      newIdToAction.set(id, button.action);
    }
  }
  return [actionToId, newIdToAction] as const;
}
