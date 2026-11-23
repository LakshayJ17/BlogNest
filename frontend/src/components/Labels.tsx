import { Sparkle } from "@phosphor-icons/react";
import { AI_LABEL } from "../lib/types";
import { cn } from "../lib/utils";

/** The story's first topic as a magazine-style kicker, plus an AI flag when relevant. */
export function StoryKicker({ labels, className }: { labels?: string[]; className?: string }) {
  const topic = labels?.find((l) => l !== AI_LABEL);
  const ai = labels?.includes(AI_LABEL);
  if (!topic && !ai) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {topic && <span className="kicker">{topic}</span>}
      {ai && <AiTag />}
    </div>
  );
}

export function AiTag() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 font-mono text-[10px] font-medium tracking-[0.08em] text-accent uppercase">
      <Sparkle size={11} weight="fill" aria-hidden="true" />
      AI assisted
    </span>
  );
}

/** Text tabs for filtering by topic. */
export function TopicTab({ label, selected, onSelect }: { label: string; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "focus-ring -mb-px shrink-0 cursor-pointer border-b-2 pb-3 pt-1 text-sm transition-colors",
        selected ? "border-accent font-medium text-ink" : "border-transparent text-muted hover:text-ink"
      )}
    >
      {label}
    </button>
  );
}

/** Toggle used in the editor to pick topics. */
export function LabelToggle({
  label,
  selected,
  onToggle,
  disabled,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        "focus-ring inline-flex h-9 shrink-0 cursor-pointer items-center rounded-md border px-3 text-sm transition-colors active:scale-[0.98] disabled:opacity-50",
        selected
          ? "border-accent bg-accent text-white"
          : "border-line-strong bg-surface text-ink-soft hover:border-[#a9b6ae] hover:bg-bone"
      )}
    >
      {label}
    </button>
  );
}
