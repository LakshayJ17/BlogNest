import { Component, type ErrorInfo, type ReactNode } from "react";
import { Wordmark } from "./Logo";
import { buttonClasses } from "./ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  failed: boolean;
}

/**
 * Shows a way out instead of a blank page when a page crashes, for example
 * when a page file from an older deploy no longer exists.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <main
        role="alert"
        className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-paper px-6 text-center"
      >
        <Wordmark className="text-2xl" />
        <h1 className="mt-4 font-serif text-3xl font-medium tracking-[-0.02em] text-ink">Something went wrong</h1>
        <p className="max-w-sm text-[15px] text-muted">This page ran into a problem. Reloading usually fixes it.</p>
        <div className="mt-2 flex gap-2">
          <button type="button" onClick={() => window.location.reload()} className={buttonClasses()}>
            Reload page
          </button>
          <a href="/" className={buttonClasses({ variant: "secondary" })}>
            Go home
          </a>
        </div>
      </main>
    );
  }
}
