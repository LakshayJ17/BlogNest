import { useState } from "react";
import { cn } from "../lib/utils";

const SIZES = {
  xs: "h-6 w-6 text-[11px]",
  sm: "h-8 w-8 text-[13px]",
  md: "h-10 w-10 text-sm",
  lg: "h-20 w-20 text-2xl",
};

// Muted pastel pairs, so initials sit quietly next to editorial type.
const TONES = [
  "bg-tag-teal-bg text-tag-teal",
  "bg-accent-soft text-accent",
  "bg-tag-red-bg text-tag-red",
  "bg-bone text-ink-soft",
];

function toneFor(name: string) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return TONES[Math.abs(hash) % TONES.length];
}

export function Avatar({
  name,
  src,
  size = "sm",
  className,
}: {
  name: string;
  src?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const displayName = name?.trim() || "Anonymous";

  if (src && !failed) {
    return (
      <img
        src={src}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={cn("shrink-0 rounded-full object-cover ring-1 ring-black/5", SIZES[size], className)}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-serif font-semibold leading-none",
        toneFor(displayName),
        SIZES[size],
        className
      )}
    >
      {displayName[0].toUpperCase()}
    </span>
  );
}
