import { useCallback, useEffect, useRef, useState } from "react";
import { Sparkle, X } from "@phosphor-icons/react";
import { API_BASE } from "../lib/api";
import { readToken } from "../lib/session";
import { tidyPunctuation } from "../lib/content";

type Status = "loading" | "streaming" | "done" | "error";

/** Streams an AI summary of a published post (server-sent events). */
export function AISummary({ postId, onClose }: { postId: string; onClose: () => void }) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState("");
  const controllerRef = useRef<AbortController | null>(null);

  const run = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setText("");
    setError("");
    setStatus("loading");

    try {
      const token = readToken();
      const response = await fetch(`${API_BASE}/blog/ai-summary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ postId }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Couldn't create a summary right now.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Events end with a blank line; keep any partial event in the buffer.
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const event of events) {
          const line = event.trim();
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (payload === "[DONE]") continue;

          const data = JSON.parse(payload) as { content?: string; error?: string };
          if (data.error) throw new Error(data.error);
          if (data.content) {
            setStatus("streaming");
            setText((current) => current + data.content);
          }
        }
      }
      setStatus("done");
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(err instanceof Error ? err.message : "Couldn't create a summary right now.");
      setStatus("error");
    }
  }, [postId]);

  useEffect(() => {
    void run();
    return () => controllerRef.current?.abort();
  }, [run]);

  return (
    <section
      aria-label="AI summary"
      aria-live="polite"
      aria-busy={status === "loading" || status === "streaming"}
      className="relative rounded-lg border border-[#cfe8d7] bg-accent-soft/70 px-6 py-5"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="inline-flex items-center gap-1.5 font-mono text-[11px] font-medium tracking-[0.12em] text-accent uppercase">
          <Sparkle size={13} weight="fill" aria-hidden="true" />
          AI summary
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close summary"
          className="focus-ring flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-accent transition-colors hover:bg-accent-soft"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      {status === "loading" && (
        <div className="mt-4 animate-pulse space-y-2" aria-hidden="true">
          <div className="h-3 w-full rounded-full bg-[#cfe8d7]" />
          <div className="h-3 w-11/12 rounded-full bg-[#cfe8d7]" />
          <div className="h-3 w-4/5 rounded-full bg-[#cfe8d7]" />
        </div>
      )}

      {(status === "streaming" || status === "done") && (
        <p className="mt-3 font-serif text-[1.0625rem] leading-relaxed text-ink-soft">
          {tidyPunctuation(text)}
          {status === "streaming" && (
            <span aria-hidden="true" className="ml-0.5 inline-block h-4 w-[3px] animate-pulse bg-accent align-middle" />
          )}
        </p>
      )}

      {status === "error" && (
        <div className="mt-3 text-sm text-ink-soft">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => void run()}
            className="focus-ring mt-2 cursor-pointer rounded-sm font-medium text-accent underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      )}

      {status === "done" && <p className="mt-3 font-mono text-[11px] text-accent/80">Written by AI. It can miss nuance.</p>}
    </section>
  );
}
