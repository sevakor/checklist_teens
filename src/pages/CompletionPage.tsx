import { useEffect, useLayoutEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { AppMenu } from "../components/AppMenu";
import { PrivacyDialog } from "../components/PrivacyDialog";
import { useChecklist } from "../features/checklist/ChecklistContext";

export function CompletionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { completed, completeChecklist, startChecklist } = useChecklist();
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const routeState = location.state as {
    direction?: string;
    completeChecklist?: boolean;
  } | null;
  const enteredForward = routeState?.direction === "forward";
  const completingNow = routeState?.completeChecklist === true;

  useLayoutEffect(() => {
    if (completingNow) completeChecklist();
  }, [completeChecklist, completingNow]);

  useEffect(() => {
    document.title = "Чекліст завершено";
  }, []);

  if (!completed && !completingNow) return <Navigate replace to="/start" />;

  const repeatChecklist = () => {
    startChecklist();
    setPrivacyOpen(false);
    navigate("/checklist/1", { state: { entry: "from-start" } });
  };

  return (
    <>
      <div className="completion-shell">
        <header className="checklist-header completion-header">
          <span />
          <AppMenu />
        </header>
        <main
          className={`completion-page${enteredForward ? " enter-from-right" : ""}`}
        >
          <p className="eyebrow">Чекліст завершено</p>
          <h1>Ти завершив/ла чекліст</h1>
          <div className="completion-copy">
            <p>Тут немає результату чи правильної кількості позначок.</p>
            <p>
              Якщо якесь твердження викликало сумнів, до цієї теми можна
              повернутися пізніше або дізнатися більше в матеріалах.
            </p>
          </div>
          <div className="completion-actions">
            <button
              className="primary-button"
              type="button"
              onClick={() => navigate("/materials")}
            >
              Перейти до матеріалів
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() => setPrivacyOpen(true)}
            >
              Пройти ще раз
            </button>
          </div>
          <p className="cleared-note" role="status">
            <span aria-hidden="true">✓</span> Твої позначки вже очищено
          </p>
        </main>
      </div>
      <PrivacyDialog
        open={privacyOpen}
        onCancel={() => setPrivacyOpen(false)}
        onConfirm={repeatChecklist}
      />
    </>
  );
}
