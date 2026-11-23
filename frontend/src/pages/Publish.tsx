import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { toast } from "react-toastify";
import { FileX, MagicWand, PaperPlaneTilt, Sparkle } from "@phosphor-icons/react";
import { api, getErrorMessage, isStatus } from "../lib/api";
import { plainTextLength, tidyPunctuation } from "../lib/content";
import { AI_LABEL, LABELS, type Post } from "../lib/types";
import { useAuthStore } from "../store/auth";
import { PageShell } from "../components/PageShell";
import { LabelToggle } from "../components/Labels";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EmptyState, ErrorState } from "../components/EmptyState";
import { Spinner } from "../components/Spinner";
import { StoryEditor } from "../components/StoryEditor";
import { buttonClasses } from "../components/ui/button";

const MAX_TITLE = 150;
type Busy = null | "draft" | "publish" | "ai";
type Mode = "new" | "draft" | "published";

export const Publish = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const fetchUserData = useAuthStore((s) => s.fetchUserData);

  const [mode, setMode] = useState<Mode>(id ? "draft" : "new");
  const [loadState, setLoadState] = useState<"loading" | "ready" | "notFound" | "error">(id ? "loading" : "ready");
  const [loadError, setLoadError] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [labels, setLabels] = useState<string[]>([]);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [busy, setBusy] = useState<Busy>(null);
  const [dirty, setDirty] = useState(false);
  const [confirmAI, setConfirmAI] = useState(false);
  const loadedId = useRef<string | null>(null);

  const markSaved = () => setDirty(false);

  // Load an existing draft or story for editing.
  useEffect(() => {
    if (!id) {
      setMode("new");
      setTitle("");
      setContent("");
      setLabels([]);
      setAiGenerated(false);
      setLoadState("ready");
      markSaved();
      loadedId.current = null;
      return;
    }
    // After saving a new draft we navigate to its URL; the editor already has its content.
    if (loadedId.current === id) return;

    const controller = new AbortController();
    setLoadState("loading");
    api
      .get<{ post: Post }>(`/blog/${encodeURIComponent(id)}`, { signal: controller.signal })
      .then(({ data }) => {
        const post = data.post;
        if (post.authorId !== user?.id) {
          setLoadState("notFound");
          return;
        }
        loadedId.current = post.id;
        setMode(post.status === "published" ? "published" : "draft");
        setTitle(post.title);
        setContent(post.content);
        setLabels(post.labels.filter((l) => l !== AI_LABEL));
        setAiGenerated(post.labels.includes(AI_LABEL));
        markSaved();
        setLoadState("ready");
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        if (isStatus(err, 404)) setLoadState("notFound");
        else {
          setLoadError(getErrorMessage(err, "Couldn't load this story."));
          setLoadState("error");
        }
      });
    return () => controller.abort();
  }, [id, user?.id]);

  // Warn before closing the tab with unsaved work.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const labelsToSend = aiGenerated ? [...labels, AI_LABEL] : labels;

  const validate = () => {
    if (!title.trim()) {
      toast.warn("Add a title first.");
      return false;
    }
    if (plainTextLength(content) === 0 && !/<img\s/i.test(content)) {
      toast.warn("Write something in your story first.");
      return false;
    }
    return true;
  };

  const save = async (target: "draft" | "publish") => {
    if (busy || !validate()) return;
    setBusy(target);
    const body = { title: title.trim(), content, labels: labelsToSend };

    try {
      if (mode === "published") {
        await api.put("/blog/publish", { ...body, id });
        markSaved();
        toast.success("Story updated");
        navigate(`/blog/${id}`);
      } else if (mode === "draft") {
        await api.patch(`/blog/${id}`, { ...body, status: target === "publish" ? "published" : "draft" });
        markSaved();
        if (target === "publish") {
          toast.success("Your story is live");
          navigate(`/blog/${id}`);
        } else {
          toast.success("Draft saved");
        }
      } else {
        const { data } = await api.post<{ id: string }>(`/blog/${target === "publish" ? "publish" : "draft"}`, body);
        markSaved();
        if (target === "publish") {
          toast.success("Your story is live");
          navigate(`/blog/${data.id}`);
        } else {
          toast.success("Draft saved");
          loadedId.current = data.id;
          setMode("draft");
          navigate(`/publish/${data.id}`, { replace: true });
        }
      }
      void fetchUserData();
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't save your story."));
    } finally {
      setBusy(null);
    }
  };

  const generate = async () => {
    setConfirmAI(false);
    setBusy("ai");
    try {
      const { data } = await api.post<{ content: string }>("/blog/ai-post", { title: title.trim() });
      setContent(tidyPunctuation(data.content));
      setAiGenerated(true);
      setDirty(true);
      toast.success("Draft written. Make it your own before publishing.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't generate a draft."));
    } finally {
      setBusy(null);
    }
  };

  const requestAI = () => {
    if (title.trim().length < 3) {
      toast.warn("Write a title first. The AI uses it as the topic.");
      return;
    }
    if (plainTextLength(content) > 0) setConfirmAI(true);
    else void generate();
  };

  const toggleLabel = (label: string) => {
    setLabels((current) => (current.includes(label) ? current.filter((l) => l !== label) : [...current, label]));
    setDirty(true);
  };

  if (loadState === "notFound" || loadState === "error") {
    return (
      <PageShell>
        {loadState === "error" ? (
          <ErrorState message={loadError} />
        ) : (
          <EmptyState
            icon={FileX}
            title="Story not found"
            description="It may have been deleted, or it belongs to someone else."
            action={
              <Link to="/publish" className={buttonClasses()}>
                Start a new story
              </Link>
            }
          />
        )}
      </PageShell>
    );
  }

  const locked = busy !== null || loadState === "loading";

  const actions = (
    <div className="flex items-center gap-2">
      {dirty && <span className="mr-1 hidden font-mono text-xs text-muted sm:inline">Unsaved</span>}
      {mode !== "published" && (
        <button
          type="button"
          onClick={() => save("draft")}
          disabled={locked}
          className={buttonClasses({ variant: "secondary", size: "sm" })}
        >
          {busy === "draft" && <Spinner />}
          Save draft
        </button>
      )}
      <button type="button" onClick={() => save("publish")} disabled={locked} className={buttonClasses({ size: "sm" })}>
        {busy === "publish" ? <Spinner /> : <PaperPlaneTilt size={15} aria-hidden="true" />}
        {mode === "published" ? "Update" : "Publish"}
      </button>
    </div>
  );

  return (
    <PageShell actions={actions} className="max-w-[46rem]">
      <Helmet>
        <title>{mode === "new" ? "New story" : "Edit story"} | BlogNest</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <h1 className="sr-only">{mode === "new" ? "Write a new story" : "Edit your story"}</h1>

      <label htmlFor="story-title" className="sr-only">
        Title
      </label>
      <textarea
        id="story-title"
        rows={1}
        value={title}
        maxLength={MAX_TITLE}
        disabled={locked}
        onChange={(e) => {
          setTitle(e.target.value.replace(/\n/g, " "));
          setDirty(true);
        }}
        onInput={(e) => {
          const el = e.currentTarget;
          el.style.height = "auto";
          el.style.height = `${el.scrollHeight}px`;
        }}
        placeholder="Title"
        autoFocus={!id}
        className="block w-full resize-none overflow-hidden border-0 bg-transparent p-0 font-serif text-[2.5rem] font-medium leading-[1.1] tracking-[-0.025em] text-ink placeholder:text-line-strong focus:outline-none focus:ring-0 disabled:opacity-60 sm:text-5xl"
      />
      {title.length > MAX_TITLE - 30 && (
        <p className="mt-1 text-right font-mono text-xs text-muted">
          {title.length}/{MAX_TITLE}
        </p>
      )}

      <div className="mt-8 flex flex-col gap-3 border-y border-line py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm">
          <p className="font-medium text-ink">Blank page?</p>
          <p className="text-muted">Write a title and AI drafts a first version for you to rewrite.</p>
        </div>
        <button
          type="button"
          onClick={requestAI}
          disabled={locked}
          className={buttonClasses({ variant: "secondary", size: "sm", className: "shrink-0" })}
        >
          {busy === "ai" ? <Spinner /> : <MagicWand size={16} aria-hidden="true" />}
          {busy === "ai" ? "Writing..." : "Draft with AI"}
        </button>
      </div>

      <fieldset className="mt-7">
        <legend className="kicker mb-3 !text-muted">Topics</legend>
        <div className="flex flex-wrap gap-2">
          {LABELS.map((label) => (
            <LabelToggle
              key={label}
              label={label}
              selected={labels.includes(label)}
              onToggle={() => toggleLabel(label)}
              disabled={locked}
            />
          ))}
          {aiGenerated && (
            <span
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-accent-soft px-3 text-sm text-accent"
              title="Added because this story was drafted with AI"
            >
              <Sparkle size={14} weight="fill" aria-hidden="true" />
              {AI_LABEL}
            </span>
          )}
        </div>
      </fieldset>

      <div className="mt-8">
        {loadState === "ready" ? (
          <StoryEditor
            value={content}
            disabled={busy !== null}
            onChange={(html) => {
              setContent(html);
              setDirty(true);
            }}
          />
        ) : (
          <div className="flex min-h-[520px] items-center justify-center rounded-lg border border-line bg-surface text-muted">
            <Spinner size="big" />
            <span className="sr-only">Loading editor</span>
          </div>
        )}
      </div>

      {confirmAI && (
        <ConfirmDialog
          open
          tone="primary"
          title="Replace your text with an AI draft?"
          description="The AI draft will replace what you've written in the editor. Your title and topics stay."
          confirmLabel="Replace"
          onConfirm={generate}
          onCancel={() => setConfirmAI(false)}
        />
      )}
    </PageShell>
  );
};
