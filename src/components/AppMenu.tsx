import { Link } from "react-router-dom";

type AppMenuProps = {
  canReset?: boolean;
  onReset?: () => void;
};

export function AppMenu({ canReset = false, onReset }: AppMenuProps) {
  return (
    <details className="app-menu">
      <summary aria-label="Відкрити меню">•••</summary>
      <div className="app-menu-panel">
        <Link to="/materials">Корисні матеріали</Link>
        {canReset ? (
          <button type="button" onClick={onReset}>
            Очистити позначки
          </button>
        ) : null}
      </div>
    </details>
  );
}
