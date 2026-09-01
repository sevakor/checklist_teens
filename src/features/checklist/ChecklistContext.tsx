/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  CHECKLIST_EXPIRED_NOTICE_KEY,
  createEmptyChecklistState,
  HIDDEN_EXPIRY_MS,
  readChecklistCompleted,
  readChecklistSession,
  writeChecklistCompleted,
  writeChecklistSession,
} from "./checklistStorage";
import type { StoredChecklistState } from "./types";

type ChecklistContextValue = {
  state: StoredChecklistState | null;
  completed: boolean;
  startChecklist: () => void;
  toggleItem: (itemId: string) => void;
  setLastStep: (step: number) => void;
  resetChecklist: () => void;
  completeChecklist: () => void;
};

const ChecklistContext = createContext<ChecklistContextValue | null>(null);

export function ChecklistProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<StoredChecklistState | null>(() =>
    readChecklistSession(),
  );
  const [completed, setCompleted] = useState(() => readChecklistCompleted());
  const stateRef = useRef(state);

  const commitState = useCallback(
    (
      update:
        | StoredChecklistState
        | null
        | ((current: StoredChecklistState | null) => StoredChecklistState | null),
    ) => {
      const next = typeof update === "function" ? update(stateRef.current) : update;
      stateRef.current = next;
      writeChecklistSession(next);
      setState(next);
    },
    [],
  );

  const startChecklist = useCallback(() => {
    commitState(createEmptyChecklistState());
  }, [commitState]);

  const toggleItem = useCallback(
    (itemId: string) => {
      commitState((current) => {
        if (!current) return current;
        const isSelected = current.selectedItemIds.includes(itemId);
        return {
          ...current,
          selectedItemIds: isSelected
            ? current.selectedItemIds.filter((id) => id !== itemId)
            : [...current.selectedItemIds, itemId],
        };
      });
    },
    [commitState],
  );

  const setLastStep = useCallback(
    (step: number) => {
      commitState((current) =>
        current && current.lastStep !== step ? { ...current, lastStep: step } : current,
      );
    },
    [commitState],
  );

  const resetChecklist = useCallback(() => {
    commitState(null);
  }, [commitState]);

  const completeChecklist = useCallback(() => {
    commitState(null);
    writeChecklistCompleted(true);
    setCompleted(true);
  }, [commitState]);

  useEffect(() => {
    const checkExpiry = () => {
      const current = stateRef.current;
      if (!current?.hiddenAt) return;

      if (Date.now() - current.hiddenAt >= HIDDEN_EXPIRY_MS) {
        window.sessionStorage.setItem(
          CHECKLIST_EXPIRED_NOTICE_KEY,
          "true",
        );
        commitState(null);
      } else {
        commitState({ ...current, hiddenAt: null });
      }
    };

    const handleVisibilityChange = () => {
      const current = stateRef.current;
      if (document.visibilityState === "hidden" && current) {
        commitState({ ...current, hiddenAt: Date.now() });
      } else if (document.visibilityState === "visible") {
        checkExpiry();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pageshow", checkExpiry);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pageshow", checkExpiry);
    };
  }, [commitState]);

  return (
    <ChecklistContext.Provider
      value={{
        state,
        completed,
        startChecklist,
        toggleItem,
        setLastStep,
        resetChecklist,
        completeChecklist,
      }}
    >
      {children}
    </ChecklistContext.Provider>
  );
}

export function useChecklist() {
  const context = useContext(ChecklistContext);
  if (!context) {
    throw new Error("useChecklist must be used inside ChecklistProvider");
  }
  return context;
}
