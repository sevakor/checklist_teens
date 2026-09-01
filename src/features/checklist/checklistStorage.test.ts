import { beforeEach, describe, expect, it } from "vitest";
import { checklistItemIds, checklistSections } from "../../content/checklist.uk";
import {
  CHECKLIST_COMPLETED_KEY,
  CHECKLIST_EXPIRED_NOTICE_KEY,
  CHECKLIST_SESSION_KEY,
  HIDDEN_EXPIRY_MS,
  createEmptyChecklistState,
  parseChecklistState,
  readChecklistCompleted,
  readChecklistSession,
  writeChecklistCompleted,
  writeChecklistSession,
} from "./checklistStorage";

describe("checklist content", () => {
  it("has exactly six sections and stable unique item ids", () => {
    expect(checklistSections).toHaveLength(6);
    expect(new Set(checklistItemIds).size).toBe(checklistItemIds.length);
  });

  it("does not contain scoring fields", () => {
    const serialized = JSON.stringify(checklistSections);
    expect(serialized).not.toMatch(/score|percentage|readinessLevel|result|passed/);
  });
});

describe("checklist storage", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    window.localStorage.clear();
  });

  it("safely rejects malformed data", () => {
    expect(parseChecklistState("not-json")).toBeNull();
    expect(parseChecklistState('{"schemaVersion":2}')).toBeNull();
  });

  it("filters unknown ids and duplicates", () => {
    const parsed = parseChecklistState(
      JSON.stringify({
        ...createEmptyChecklistState(),
        selectedItemIds: [checklistItemIds[0], "unknown", checklistItemIds[0]],
      }),
    );

    expect(parsed?.selectedItemIds).toEqual([checklistItemIds[0]]);
  });

  it("restores a valid page session", () => {
    const state = {
      ...createEmptyChecklistState(),
      selectedItemIds: [checklistItemIds[0]],
      lastStep: 3,
    };
    writeChecklistSession(state);
    expect(readChecklistSession()).toEqual(state);
  });

  it("expires answers after fifteen minutes in the background", () => {
    const now = 2_000_000;
    window.sessionStorage.setItem(
      CHECKLIST_SESSION_KEY,
      JSON.stringify({
        ...createEmptyChecklistState(),
        selectedItemIds: [checklistItemIds[0]],
        hiddenAt: now - HIDDEN_EXPIRY_MS,
      }),
    );

    expect(readChecklistSession(now)).toBeNull();
    expect(window.sessionStorage.getItem(CHECKLIST_SESSION_KEY)).toBeNull();
    expect(window.sessionStorage.getItem(CHECKLIST_EXPIRED_NOTICE_KEY)).toBe(
      "true",
    );
  });

  it("stores only the completion fact in local storage", () => {
    writeChecklistCompleted(true);
    expect(readChecklistCompleted()).toBe(true);
    expect(window.localStorage.getItem(CHECKLIST_COMPLETED_KEY)).toBe("true");
    expect(window.localStorage).toHaveLength(1);
  });
});
