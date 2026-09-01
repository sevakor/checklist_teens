import { checklistItemIds, checklistSections } from "../../content/checklist.uk";
import type { StoredChecklistState } from "./types";

export const CHECKLIST_SESSION_KEY = "intimacy-reflection-checklist:session:v1";
export const CHECKLIST_COMPLETED_KEY = "intimacy-reflection-checklist:completed:v1";
export const CHECKLIST_EXPIRED_NOTICE_KEY =
  "intimacy-reflection-checklist:expired-notice:v1";
export const HIDDEN_EXPIRY_MS = 15 * 60 * 1000;

const knownItemIds = new Set(checklistItemIds);

function hasSessionStorage() {
  return typeof window !== "undefined" && "sessionStorage" in window;
}

function hasLocalStorage() {
  return typeof window !== "undefined" && "localStorage" in window;
}

export function createEmptyChecklistState(): StoredChecklistState {
  return {
    schemaVersion: 1,
    selectedItemIds: [],
    lastStep: 1,
    hiddenAt: null,
  };
}

export function parseChecklistState(value: string | null): StoredChecklistState | null {
  if (!value) return null;

  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object") return null;

    const candidate = parsed as Partial<StoredChecklistState>;
    if (candidate.schemaVersion !== 1) return null;
    if (!Array.isArray(candidate.selectedItemIds)) return null;
    if (
      typeof candidate.lastStep !== "number" ||
      !Number.isInteger(candidate.lastStep) ||
      candidate.lastStep < 1 ||
      candidate.lastStep > checklistSections.length
    ) {
      return null;
    }
    if (candidate.hiddenAt !== null && typeof candidate.hiddenAt !== "number") {
      return null;
    }

    const selectedItemIds = Array.from(
      new Set(
        candidate.selectedItemIds.filter(
          (itemId): itemId is string =>
            typeof itemId === "string" && knownItemIds.has(itemId),
        ),
      ),
    );

    return {
      schemaVersion: 1,
      selectedItemIds,
      lastStep: candidate.lastStep,
      hiddenAt: candidate.hiddenAt,
    };
  } catch {
    return null;
  }
}

export function readChecklistSession(now = Date.now()): StoredChecklistState | null {
  if (!hasSessionStorage()) return null;

  const parsed = parseChecklistState(
    window.sessionStorage.getItem(CHECKLIST_SESSION_KEY),
  );

  if (!parsed) {
    window.sessionStorage.removeItem(CHECKLIST_SESSION_KEY);
    return null;
  }

  if (parsed.hiddenAt !== null && now - parsed.hiddenAt >= HIDDEN_EXPIRY_MS) {
    window.sessionStorage.removeItem(CHECKLIST_SESSION_KEY);
    window.sessionStorage.setItem(CHECKLIST_EXPIRED_NOTICE_KEY, "true");
    return null;
  }

  return parsed;
}

export function writeChecklistSession(state: StoredChecklistState | null) {
  if (!hasSessionStorage()) return;

  if (!state) {
    window.sessionStorage.removeItem(CHECKLIST_SESSION_KEY);
    return;
  }

  window.sessionStorage.setItem(CHECKLIST_SESSION_KEY, JSON.stringify(state));
}

export function takeExpiredNotice() {
  if (!hasSessionStorage()) return false;
  const shouldShow =
    window.sessionStorage.getItem(CHECKLIST_EXPIRED_NOTICE_KEY) === "true";
  window.sessionStorage.removeItem(CHECKLIST_EXPIRED_NOTICE_KEY);
  return shouldShow;
}

export function readChecklistCompleted() {
  if (!hasLocalStorage()) return false;
  return window.localStorage.getItem(CHECKLIST_COMPLETED_KEY) === "true";
}

export function writeChecklistCompleted(completed: boolean) {
  if (!hasLocalStorage()) return;
  if (completed) {
    window.localStorage.setItem(CHECKLIST_COMPLETED_KEY, "true");
  } else {
    window.localStorage.removeItem(CHECKLIST_COMPLETED_KEY);
  }
}
