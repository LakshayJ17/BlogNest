import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Notebook, NotePencil } from "@phosphor-icons/react";
import { useDrafts } from "../hooks";
import { PageShell } from "../components/PageShell";
import { BlogCard } from "../components/BlogCard";
import { BlogListSkeleton } from "../components/BlogSkeleton";
import { EmptyState, ErrorState } from "../components/EmptyState";
import { buttonClasses } from "../components/ui/button";

export const Drafts = () => {
  const { drafts, status, error, removeDraft, retry } = useDrafts();

  return (
    <PageShell>
      <Helmet>
        <title>Drafts | BlogNest</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <header className="flex flex-col gap-6 border-b border-line-strong pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="kicker">Only you can see these</p>
          <h1 className="mt-3 font-serif text-[2.75rem] font-medium leading-[1.05] tracking-[-0.025em] text-ink">
            Drafts
            {status === "ready" && drafts.length > 0 && (
              <span className="ml-3 align-middle font-mono text-base font-normal tracking-normal text-faint">
                {drafts.length}
              </span>
            )}
          </h1>
        </div>
        <Link to="/publish" className={buttonClasses({ variant: "secondary", className: "self-start sm:self-auto" })}>
          <NotePencil size={16} aria-hidden="true" />
          New story
        </Link>
      </header>

      <section aria-label="Drafts" aria-busy={status === "loading"}>
        {status === "loading" && <BlogListSkeleton count={3} />}
        {status === "error" && (
          <div className="mt-8">
            <ErrorState message={error} onRetry={retry} />
          </div>
        )}
        {status === "ready" && drafts.length === 0 && (
          <EmptyState
            className="border-t-0"
            icon={Notebook}
            title="No drafts yet"
            description="Start a story and save it as a draft. It waits here until you publish it."
            action={
              <Link to="/publish" className={buttonClasses()}>
                Start a story
              </Link>
            }
          />
        )}
        {status === "ready" && drafts.length > 0 && (
          <div className="divide-y divide-line border-b border-line">
            {drafts.map((draft) => (
              <BlogCard key={draft.id} post={draft} onDeleted={removeDraft} />
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
};
