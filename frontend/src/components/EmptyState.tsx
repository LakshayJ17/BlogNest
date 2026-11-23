import { ReactNode } from "react";
import type { Icon } from "@phosphor-icons/react";
import { cn } from "../lib/utils";

export function EmptyState({
  icon: IconComponent,
  title,
  description,
  action,
  className,
}: {
  icon: Icon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-y border-line py-16 text-center", className)}>
      <IconComponent size={28} weight="light" aria-hidden="true" className="mx-auto text-faint" />
      <h2 className="mt-4 font-serif text-2xl font-medium tracking-[-0.01em] text-ink">{title}</h2>
      {description && <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-muted">{description}</p>}
      {action && <div className="mt-7 flex justify-center">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-lg border border-[#f3d3d3] bg-tag-red-bg px-6 py-8 text-center">
      <p className="text-[15px] text-tag-red">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="focus-ring mt-4 inline-flex h-9 cursor-pointer items-center rounded-md border border-[#ecc0bf] bg-surface px-3 text-sm font-medium text-tag-red transition-colors hover:bg-[#fff7f7] active:scale-[0.98]"
        >
          Try again
        </button>
      )}
    </div>
  );
}
