import { useEffect, useRef } from "react";

type ResetAnswersDialogProps = {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ResetAnswersDialog({
  open,
  onCancel,
  onConfirm,
}: ResetAnswersDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      aria-labelledby="reset-dialog-title"
      className="dialog dialog-small"
      onCancel={onCancel}
      ref={dialogRef}
    >
      <div className="dialog-content">
        <h2 id="reset-dialog-title">Очистити позначки?</h2>
        <p>Усі позначки цього проходження буде видалено. Цю дію не можна скасувати.</p>
        <div className="dialog-actions">
          <button className="secondary-button" type="button" onClick={onCancel}>
            Скасувати
          </button>
          <button className="danger-button" type="button" onClick={onConfirm}>
            Очистити
          </button>
        </div>
      </div>
    </dialog>
  );
}
