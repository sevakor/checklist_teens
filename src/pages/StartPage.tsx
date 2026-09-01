import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PrivacyDialog } from "../components/PrivacyDialog";
import { ResetAnswersDialog } from "../components/ResetAnswersDialog";
import { useChecklist } from "../features/checklist/ChecklistContext";
import { takeExpiredNotice } from "../features/checklist/checklistStorage";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

export function StartPage() {
  const navigate = useNavigate();
  const prefersReducedMotion = usePrefersReducedMotion();
  const { state, completed, startChecklist, resetChecklist } = useChecklist();
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [expired] = useState(() => takeExpiredNotice());

  useEffect(() => {
    document.title = "Чекліст: чи готовий/а я до сексу?";
  }, []);

  const moveToChecklist = (fresh: boolean) => {
    if (fresh) startChecklist();
    setPrivacyOpen(false);
    setIsLeaving(true);
    window.setTimeout(
      () => {
        navigate(`/checklist/${fresh ? 1 : state?.lastStep ?? 1}`, {
          state: { entry: "from-start" },
        });
      },
      prefersReducedMotion ? 0 : 520,
    );
  };

  const confirmReset = () => {
    resetChecklist();
    setResetOpen(false);
  };

  return (
    <>
      <main className={`start-page${isLeaving ? " is-leaving" : ""}`}>
        <section className="start-card" aria-labelledby="start-title">
          <p className="eyebrow">Приватний чекліст</p>
          <h1 id="start-title">Чи готовий/а я до інтимної близькості?</h1>
          <p className="start-copy">
            Це не тест і тут немає правильної кількості відповідей. Позначай
            лише те, що справді відгукується тобі.
          </p>

          <aside className="privacy-note">
            <span aria-hidden="true">!</span>
            <p>
              Твої позначки залишаться між нами й не передаватимуться третім
              особам ;)
            </p>
          </aside>

          {expired ? (
            <p className="status-note" role="status">
              Минуло 15 хвилин, тому попередні позначки очищено для приватності.
            </p>
          ) : null}

          {state ? (
            <div className="start-actions">
              <button
                className="primary-button"
                type="button"
                onClick={() => moveToChecklist(false)}
              >
                Продовжити з кроку {state.lastStep}
              </button>
              <button
                className="secondary-button"
                type="button"
                onClick={() => setPrivacyOpen(true)}
              >
                Почати заново
              </button>
              <button
                className="text-button"
                type="button"
                onClick={() => setResetOpen(true)}
              >
                Очистити позначки
              </button>
            </div>
          ) : (
            <button
              className="primary-button"
              type="button"
              onClick={() => setPrivacyOpen(true)}
            >
              {completed ? "Пройти ще раз" : "Почати"}
            </button>
          )}

          <button
            className="secondary-button materials-button"
            type="button"
            onClick={() => navigate("/materials")}
          >
            Переглянути корисні матеріали <span aria-hidden="true">→</span>
          </button>
        </section>
      </main>

      <PrivacyDialog
        open={privacyOpen}
        onCancel={() => setPrivacyOpen(false)}
        onConfirm={() => moveToChecklist(true)}
      />
      <ResetAnswersDialog
        open={resetOpen}
        onCancel={() => setResetOpen(false)}
        onConfirm={confirmReset}
      />
    </>
  );
}
