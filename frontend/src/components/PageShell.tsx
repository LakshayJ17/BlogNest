import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { cn } from "../lib/utils";

/** Standard page frame: header, main landmark, optional footer. */
export function PageShell({
  children,
  actions,
  footer = false,
  className,
}: {
  children: ReactNode;
  actions?: ReactNode;
  footer?: boolean;
  className?: string;
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <Navbar actions={actions} />
      <main id="main" className={cn("mx-auto w-full max-w-3xl flex-1 px-5 py-12 sm:px-8 sm:py-16", className)}>
        {children}
      </main>
      {footer && <Footer />}
    </div>
  );
}
