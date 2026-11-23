import { Link } from "react-router-dom";
import { cn } from "../lib/utils";

/** Text-only wordmark. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("text-[1.375rem] font-bold tracking-[-0.03em] text-ink", className)}>BlogNest</span>
  );
}

export function Logo({ to = "/", className }: { to?: string; className?: string }) {
  return (
    <Link to={to} aria-label="BlogNest home" className="focus-ring rounded-md">
      <Wordmark className={className} />
    </Link>
  );
}
