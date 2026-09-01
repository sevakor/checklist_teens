import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";

const materialTitles: Record<string, string> = {
  consent: "Згода",
  "sex-myths": "Міфи про секс",
  protection: "Секс і захист",
  "healthy-relations": "Здорові стосунки",
};

export function MaterialPlaceholderPage() {
  const { materialSlug } = useParams();
  const title = materialSlug ? materialTitles[materialSlug] : undefined;

  useEffect(() => {
    if (title) document.title = `${title} — корисні матеріали`;
  }, [title]);

  if (!title) return <Navigate replace to="/materials" />;

  return (
    <main className="article-placeholder">
      <Link className="back-link" to="/materials">
        <span aria-hidden="true">←</span> Усі матеріали
      </Link>
      <div className="article-placeholder-content">
        <h1>{title}</h1>
        <p>
          Структуру цього матеріалу вже закладено. Текстові блоки, спойлери й
          наявні інтерактиви буде оформлено на наступному етапі.
        </p>
        <Link className="secondary-link" to="/materials">
          Повернутися до каталогу
        </Link>
      </div>
    </main>
  );
}
