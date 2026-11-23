import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { MagnifyingGlass, NotePencil, Tray, X } from "@phosphor-icons/react";
import { useBlogs, useDebounced } from "../hooks";
import { useAuthStore } from "../store/auth";
import { FILTER_LABELS } from "../lib/types";
import { PageShell } from "../components/PageShell";
import { BlogCard } from "../components/BlogCard";
import { BlogListSkeleton } from "../components/BlogSkeleton";
import { EmptyState, ErrorState } from "../components/EmptyState";
import { TopicTab } from "../components/Labels";
import { Spinner } from "../components/Spinner";
import { buttonClasses } from "../components/ui/button";
import { SITE_URL } from "../config";
import { cn } from "../lib/utils";

type Sort = "latest" | "popular";

export const Blogs = () => {
  const user = useAuthStore((s) => s.user);
  const [params, setParams] = useSearchParams();
  const label = params.get("label") ?? "";
  const sort: Sort = params.get("sort") === "popular" ? "popular" : "latest";
  const [query, setQuery] = useState(params.get("q") ?? "");
  const debouncedQuery = useDebounced(query.trim(), 400);

  const { posts, status, error, hasMore, loadingMore, loadMore, removePost, retry } = useBlogs({
    q: debouncedQuery,
    label,
    sort,
  });

  // Keep the search text in the URL so results can be shared and survive reloads.
  useEffect(() => {
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (debouncedQuery) next.set("q", debouncedQuery);
        else next.delete("q");
        return next;
      },
      { replace: true }
    );
  }, [debouncedQuery, setParams]);

  const setParam = (key: string, value: string) => {
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true }
    );
  };

  // Keep the selected topic visible in the scrolling tab row.
  const tabsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const row = tabsRef.current;
    const tab = row?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (row && tab) row.scrollTo({ left: tab.offsetLeft - row.clientWidth / 2 + tab.clientWidth / 2 });
  }, [label]);

  const hasFilters = Boolean(debouncedQuery || label);
  const clearFilters = () => {
    setQuery("");
    setParams({}, { replace: true });
  };

  return (
    <>
      <Helmet>
        <title>Explore stories | BlogNest</title>
        <meta
          name="description"
          content="Read stories on BlogNest about technology, music, sports, space, entertainment, and hobbies, written by the community."
        />
        <meta property="og:title" content="Explore stories | BlogNest" />
        <meta property="og:url" content={`${SITE_URL}/blogs`} />
        <link rel="canonical" href={`${SITE_URL}/blogs`} />
      </Helmet>

      <PageShell footer>
        <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="kicker">Explore</p>
            <h1 className="mt-3 font-serif text-[2.75rem] font-medium leading-[1.05] tracking-[-0.025em] text-ink">
              {sort === "popular" ? "Most liked stories" : "Latest stories"}
            </h1>
          </div>
          <div role="group" aria-label="Sort stories" className="flex items-center gap-1 text-sm">
            {(
              [
                ["latest", "Latest"],
                ["popular", "Most liked"],
              ] as const
            ).map(([value, text]) => (
              <button
                key={value}
                type="button"
                aria-pressed={sort === value}
                onClick={() => setParam("sort", value === "latest" ? "" : value)}
                className={cn(
                  "focus-ring h-9 cursor-pointer rounded-md px-3 transition-colors",
                  sort === value ? "bg-bone font-medium text-ink" : "text-muted hover:text-ink"
                )}
              >
                {text}
              </button>
            ))}
          </div>
        </header>

        <form role="search" onSubmit={(e) => e.preventDefault()} className="relative mt-10">
          <label htmlFor="story-search" className="sr-only">
            Search stories
          </label>
          <MagnifyingGlass
            size={18}
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint"
          />
          <input
            id="story-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            maxLength={100}
            placeholder="Search titles and text"
            className="h-12 w-full rounded-md border border-line-strong bg-surface pl-11 pr-11 text-[15px] text-ink placeholder:text-faint transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="focus-ring absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-muted transition-colors hover:bg-bone hover:text-ink"
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </form>

        <div
          ref={tabsRef}
          role="group"
          aria-label="Filter by topic"
          className="mt-8 flex gap-6 overflow-x-auto border-b border-line [scrollbar-width:none]"
        >
          <TopicTab label="All topics" selected={!label} onSelect={() => setParam("label", "")} />
          {FILTER_LABELS.map((option) => (
            <TopicTab
              key={option}
              label={option}
              selected={label === option}
              onSelect={() => setParam("label", label === option ? "" : option)}
            />
          ))}
        </div>

        <section aria-label="Stories" aria-busy={status === "loading"} className="mt-2">
          {status === "loading" && <BlogListSkeleton />}

          {status === "error" && (
            <div className="mt-8">
              <ErrorState message={error} onRetry={retry} />
            </div>
          )}

          {status === "ready" && posts.length === 0 && (
            <EmptyState
              className="mt-8 border-t-0"
              icon={Tray}
              title={hasFilters ? "Nothing matches that" : "No stories yet"}
              description={hasFilters ? "Try another word or topic." : "Be the first to publish something here."}
              action={
                hasFilters ? (
                  <button type="button" onClick={clearFilters} className={buttonClasses({ variant: "secondary" })}>
                    Clear search and topic
                  </button>
                ) : (
                  <Link to={user ? "/publish" : "/signup"} className={buttonClasses()}>
                    <NotePencil size={16} aria-hidden="true" />
                    Write a story
                  </Link>
                )
              }
            />
          )}

          {status === "ready" && posts.length > 0 && (
            <>
              <div className="divide-y divide-line border-b border-line">
                {posts.map((post) => (
                  <BlogCard key={post.id} post={post} onDeleted={removePost} />
                ))}
              </div>
              {hasMore && (
                <div className="mt-10 flex justify-center">
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={loadingMore}
                    className={buttonClasses({ variant: "secondary" })}
                  >
                    {loadingMore && <Spinner />}
                    {loadingMore ? "Loading" : "Load more stories"}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </PageShell>
    </>
  );
};
