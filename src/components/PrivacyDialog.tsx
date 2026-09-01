import { useEffect, useRef } from "react";

type PrivacyDialogProps = {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function PrivacyDialog({ open, onCancel, onConfirm }: PrivacyDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      aria-labelledby="privacy-dialog-title"
      className="dialog"
      onCancel={onCancel}
      ref={dialogRef}
    >
      <div className="dialog-content">
        <h2 id="privacy-dialog-title">
          Ми тут трошки запарились над сек’юрністю, щоб тобі було комфортно.
          Тому є кілька нюансів:
        </h2>
        <ul className="dialog-list">
          <li>
            якщо закрити вкладку або залишити її у фоні на 15 хвилин, позначки
            самоочистяться — доведеться почати спочатку
          </li>
          <li>
            після завершення чекліста позначки також самоочистяться, але його
            завжди можна пройти ще раз
          </li>
          <li>цей чекліст — для тебе, і забере приблизно 5–7 хвилин</li>
        </ul>
        <button className="primary-button" type="button" onClick={onConfirm}>
          Ок
        </button>
      </div>
    </dialog>
  );
}
