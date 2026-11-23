import { cn } from "../../lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

// One button family for the whole site: ink solid, hairline outline, and quiet text.
const base =
  "inline-flex items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap select-none cursor-pointer " +
  "transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.98] focus-ring " +
  "disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-white hover:bg-accent-strong",
  secondary: "border border-line-strong bg-surface text-ink hover:border-[#a9b6ae] hover:bg-bone",
  ghost: "text-muted hover:bg-bone hover:text-ink",
  danger: "bg-tag-red text-white hover:bg-[#862624]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-[15px]",
  icon: "h-9 w-9",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

/** Inline text link with an accent underline. */
export const textLink =
  "font-medium text-ink underline decoration-accent decoration-1 underline-offset-4 transition-colors hover:decoration-ink focus-ring rounded-sm";
