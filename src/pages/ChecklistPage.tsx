import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { AppMenu } from "../components/AppMenu";
import { ChecklistItemCard } from "../components/ChecklistItemCard";
import { ResetAnswersDialog } from "../components/ResetAnswersDialog";
import { checklistSections } from "../content/checklist.uk";
import { useChecklist } from "../features/checklist/ChecklistContext";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

type NavigationDirection = "forward" | "back";

export function ChecklistPage() {
  const { step } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const prefersReducedMotion = usePrefersReducedMotion();
  const { state, toggleItem, setLastStep, resetChecklist } = useChecklist();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [exitDirection, setExitDirection] = useState<NavigationDirection | null>(
    null,
  );
  const [resetOpen, setResetOpen] = useState(false);

  const stepNumber = Number(step);
  const section = checklistSections[stepNumber - 1];
  const entry = location.state as
    | { direction?: NavigationDirection; entry?: "from-start" }
    | null;

  useEffect(() => {
    if (!section) return;
    setLastStep(stepNumber);
    document.title = `${section.title} — крок ${stepNumber} із ${checklistSections.length}`;
    window.scrollTo({ top: 0, behavior: "instant" });
    headingRef.current?.focus({ preventScroll: true });
  }, [section, setLastStep, stepNumber]);

  if (!state) return <Navigate replace to="/" />;
  if (!section) return <Navigate replace to={`/checklist/${state.lastStep}`} />;

  const move = (target: string, direction: NavigationDirection) => {
    if (exitDirection) return;
    setExitDirection(direction);
    window.setTimeout(
      () => navigate(target, { state: { direction } }),
      prefersReducedMotion ? 0 : 280,
    );
  };

  const handleNext = () => {
    if (stepNumber === checklistSections.length) {
      setExitDirection("forward");
      window.setTimeout(
        () => {
          navigate("/complete", {
            replace: true,
            state: { direction: "forward", completeChecklist: true },
          });
        },
        prefersReducedMotion ? 0 : 280,
      );
      return;
    }
    move(`/checklist/${stepNumber + 1}`, "forward");
  };

  const handleBack = () => {
    if (stepNumber === 1) {
      navigate("/start");
      return;
    }
    move(`/checklist/${stepNumber - 1}`, "back");
  };

  const confirmReset = () => {
    resetChecklist();
    setResetOpen(false);
    navigate("/start", { replace: true });
  };

  const entryClass = entry?.entry
    ? " enter-from-below"
    : entry?.direction === "forward"
      ? " enter-from-right"
      : entry?.direction === "back"
        ? " enter-from-left"
        : "";
  const exitClass =
    exitDirection === "forward"
      ? " exit-to-left"
      : exitDirection === "back"
        ? " exit-to-right"
        : "";

  return (
    <div className="checklist-shell">
      <header className="checklist-header">
        <button className="back-link" type="button" onClick={() => navigate("/start")}>
          <span aria-hidden="true">←</span> На початок
        </button>
        <AppMenu canReset onReset={() => setResetOpen(true)} />
      </header>

      <main className={`checklist-content${entryClass}${exitClass}`}>
        <div
          className="step-progress"
          role="progressbar"
          aria-label={`Крок ${stepNumber} із ${checklistSections.length}`}
          aria-valuemin={1}
          aria-valuemax={checklistSections.length}
          aria-valuenow={stepNumber}
        >
          {checklistSections.map((progressSection, index) => {
            const progressStep = index + 1;
            const stateClass =
              progressStep === stepNumber
                ? " is-current"
                : progressStep < stepNumber
                  ? " is-complete"
                  : "";

            return (
              <span
                aria-hidden="true"
                className={`progress-dot${stateClass}`}
                key={progressSection.id}
              />
            );
          })}
        </div>
        <h1 className="step-title" ref={headingRef} tabIndex={-1}>
          {section.title}
        </h1>
        <p className="step-intro">{section.intro}</p>

        <div className="checklist-items">
          {section.items.map((item) => (
            <ChecklistItemCard
              item={item}
              key={item.id}
              selected={state.selectedItemIds.includes(item.id)}
              onToggle={() => toggleItem(item.id)}
            />
          ))}
        </div>
      </main>

      <footer className="step-footer">
        <div className="step-footer-inner">
          <button className="secondary-button" type="button" onClick={handleBack}>
            Назад
          </button>
          <button className="primary-button" type="button" onClick={handleNext}>
            {stepNumber === checklistSections.length ? "Завершити" : "Далі"}
          </button>
        </div>
      </footer>

      <ResetAnswersDialog
        open={resetOpen}
        onCancel={() => setResetOpen(false)}
        onConfirm={confirmReset}
      />
    </div>
  );
}
