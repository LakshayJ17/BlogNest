import { useEffect, useRef } from "react";
import { buttonClasses } from "./ui/button";
import { Spinner } from "./Spinner";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  tone?: "danger" | "primary";
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Accessible modal built on the native <dialog> element (focus trap and Escape built in). */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  tone = "danger",
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onCancel();
      }}
      onClick={(e) => {
        if (e.target === ref.current && !busy) onCancel();
      }}
      aria-labelledby="confirm-title"
      aria-describedby="confirm-description"
      className="m-auto w-[calc(100%-2.5rem)] max-w-md rounded-xl border border-line bg-surface p-0 shadow-float"
    >
      <div className="p-7">
        <h2 id="confirm-title" className="font-serif text-[1.375rem] font-medium tracking-[-0.01em] text-ink">
          {title}
        </h2>
        <p id="confirm-description" className="mt-2 text-[15px] leading-relaxed text-muted">
          {description}
        </p>
        <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" className={buttonClasses({ variant: "secondary" })} onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button
            type="button"
            className={buttonClasses({ variant: tone === "danger" ? "danger" : "primary" })}
            onClick={onConfirm}
            disabled={busy}
            autoFocus
          >
            {busy && <Spinner />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
