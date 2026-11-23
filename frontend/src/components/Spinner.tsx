import { cn } from "../lib/utils";

export const Spinner = ({ size = "small", className }: { size?: "small" | "big"; className?: string }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    fill="none"
    className={cn("animate-spin", size === "small" ? "h-4 w-4" : "h-8 w-8", className)}
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
    <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);
