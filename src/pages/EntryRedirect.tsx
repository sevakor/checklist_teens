import { Navigate } from "react-router-dom";
import { useChecklist } from "../features/checklist/ChecklistContext";

export function EntryRedirect() {
  const { state, completed } = useChecklist();

  if (state) {
    return <Navigate replace to={`/checklist/${state.lastStep}`} />;
  }

  return <Navigate replace to={completed ? "/materials" : "/start"} />;
}
