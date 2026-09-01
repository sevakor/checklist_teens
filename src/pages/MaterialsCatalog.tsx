import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppMenu } from "../components/AppMenu";
import { PrivacyDialog } from "../components/PrivacyDialog";
import { useChecklist } from "../features/checklist/ChecklistContext";

const materials = [
  {
    slug: "consent",
    title: "Згода",
    description: "Як звучить і виглядає вільна, чітка та взаємна згода.",
  },
  {
    slug: "sex-myths",
    title: "Міфи про секс",
    description: "Що, звідки ноги ростуть, і як воно насправді.",
  },
  {
    slug: "protection",
    title: "Секс і захист",
    description: "Основне про контрацепцію, презервативи та ІПСШ.",
  },
  {
    slug: "healthy-relations",
    title: "Здорові стосунки",
    description:
      "Поширені запитання про здорові стосунки, довіру, межі, рівність та підтримку.",
  },
];

export function MaterialsCatalog() {
  const navigate = useNavigate();
  const { startChecklist } = useChecklist();
  const [privacyOpen, setPrivacyOpen] = useState(false);

  useEffect(() => {
    document.title = "Корисні матеріали";
  }, []);

  const startAgain = () => {
    startChecklist();
    setPrivacyOpen(false);
    navigate("/checklist/1", { state: { entry: "from-start" } });
  };

  return (
    <>
      <div className="materials-shell">
        <header className="checklist-header materials-header">
          <button className="back-link" type="button" onClick={() => navigate("/start")}>
            <span aria-hidden="true">←</span> Про чекліст
          </button>
          <AppMenu />
        </header>
        <main className="materials-page">
          <h1>Корисні матеріали</h1>
          <p className="materials-intro">
            Тут можна спокійно розібратися в темах, до яких хочеться повернутися
            або про які хочеться дізнатися більше.
          </p>

          <div className="materials-grid">
            {materials.map((material, index) => (
              <Link className="material-card" key={material.slug} to={`/materials/${material.slug}`}>
                <span className="material-number">0{index + 1}</span>
                <h2>{material.title}</h2>
                <p>{material.description}</p>
                <span className="material-arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            ))}
          </div>

          <button
            className="secondary-button repeat-button"
            type="button"
            onClick={() => setPrivacyOpen(true)}
          >
            Пройти чекліст ще раз
          </button>
        </main>
      </div>
      <PrivacyDialog
        open={privacyOpen}
        onCancel={() => setPrivacyOpen(false)}
        onConfirm={startAgain}
      />
    </>
  );
}
