import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FileX, MagicWand, PencilSimpleLine } from "@phosphor-icons/react";
import { useBlog } from "../hooks";
import { useLike } from "../hooks/useLike";
import { useAuthStore } from "../store/auth";
import { safeHtml } from "../lib/content";
import { AI_LABEL, type Post } from "../lib/types";
import { SITE_URL } from "../config";
import { PageShell } from "../components/PageShell";
import { Avatar } from "../components/Avatar";
import { AiTag } from "../components/Labels";
import { LikeButton } from "../components/LikeButton";
import { PostedDate } from "../components/PostedDate";
import { ShareMenu } from "../components/ShareMenu";
import { PostMenu } from "../components/PostMenu";
import { AISummary } from "../components/AISummary";
import { EmptyState, ErrorState } from "../components/EmptyState";
import { buttonClasses } from "../components/ui/button";

export const Blog = () => {
  const { id } = useParams();
  const { post, status, error, retry } = useBlog(id);

  return (
    <PageShell footer className="max-w-[46rem]">
      {status === "loading" && <ArticleSkeleton />}
      {status === "error" && <ErrorState message={error} onRetry={retry} />}
      {status === "notFound" && (
        <EmptyState
          icon={FileX}
          title="This story isn't here"
          description="It may have been deleted, or the link is wrong."
          action={
            <Link to="/blogs" className={buttonClasses()}>
              Browse stories
            </Link>
          }
        />
      )}
      {status === "ready" && post && <Article post={post} />}
    </PageShell>
  );
};

function Article({ post }: { post: Post }) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [showSummary, setShowSummary] = useState(false);
  const isDraft = post.status === "draft";
  const isOwner = user?.id === post.authorId;
  const { liked, likes, toggleLike, disabled } = useLike(post.id, post._count.likes, { disabled: isDraft });

  const html = useMemo(() => safeHtml(post.content), [post.content]);
  const description = useMemo(() => {
    const text = new DOMParser().parseFromString(html, "text/html").body.textContent ?? "";
    return text.replace(/\s+/g, " ").trim().slice(0, 160) || "Read this story on BlogNest.";
  }, [html]);
  const url = `${SITE_URL}/blog/${post.id}`;
  const topics = post.labels.filter((l) => l !== AI_LABEL);
  const aiAssisted = post.labels.includes(AI_LABEL);

  return (
    <>
      <Helmet>
        <title>{`${post.title} | BlogNest`}</title>
        <meta name="description" content={description} />
        <meta name="author" content={post.author.name} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="article:published_time" content={post.date} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={description} />
        <link rel="canonical" href={url} />
        {isDraft && <meta name="robots" content="noindex" />}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description,
            datePublished: post.date,
            author: { "@type": "Person", name: post.author.name },
            publisher: { "@type": "Organization", name: "BlogNest" },
            mainEntityOfPage: { "@type": "WebPage", "@id": url },
            keywords: post.labels,
          })}
        </script>
      </Helmet>

      <article>
        {isDraft && (
          <div className="mb-10 flex flex-col gap-2 rounded-md bg-tag-teal-bg px-4 py-3 text-sm text-tag-teal sm:flex-row sm:items-center sm:justify-between">
            <span>This is a draft. Only you can see it.</span>
            <Link
              to={`/publish/${post.id}`}
              className="focus-ring inline-flex items-center gap-1.5 rounded-sm font-medium underline underline-offset-4"
            >
              <PencilSimpleLine size={15} aria-hidden="true" />
              Continue editing
            </Link>
          </div>
        )}

        <header className="animate-enter">
          {(topics.length > 0 || aiAssisted) && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              {topics.map((topic) => (
                <Link
                  key={topic}
                  to={`/blogs?label=${encodeURIComponent(topic)}`}
                  className="kicker focus-ring rounded-sm hover:text-accent-strong"
                >
                  {topic}
                </Link>
              ))}
              {aiAssisted && <AiTag />}
            </div>
          )}

          <h1 className="mt-5 font-serif text-[2.5rem] font-medium leading-[1.08] tracking-[-0.028em] text-ink sm:text-5xl lg:text-[3.5rem]">
            {post.title}
          </h1>

          <div className="mt-8 flex items-center gap-3">
            <Avatar name={post.author.name} src={post.author.avatar} size="md" />
            <div>
              <p className="text-[15px] font-medium text-ink">{post.author.name}</p>
              <p className="mt-0.5 font-mono text-xs text-muted">
                <PostedDate date={post.date} />
                <span aria-hidden="true" className="mx-1.5 text-faint">
                  /
                </span>
                {post.readingMinutes} min read
              </p>
            </div>
          </div>
        </header>

        <div className="mt-8 flex flex-wrap items-center gap-1 border-y border-line py-2">
          <LikeButton liked={liked} likes={likes} onClick={toggleLike} disabled={disabled} />
          {!isDraft && (
            <button
              type="button"
              onClick={() => setShowSummary(true)}
              disabled={showSummary}
              className={buttonClasses({ variant: "ghost", size: "sm" })}
            >
              <MagicWand size={16} aria-hidden="true" />
              Summarize
            </button>
          )}
          <div className="ml-auto flex items-center gap-0.5">
            {isOwner && !isDraft && (
              <Link to={`/publish/${post.id}`} className={buttonClasses({ variant: "ghost", size: "sm" })}>
                <PencilSimpleLine size={16} aria-hidden="true" />
                Edit
              </Link>
            )}
            {!isDraft && <ShareMenu url={url} title={post.title} />}
            <PostMenu
              postId={post.id}
              authorId={post.authorId}
              isDraft={isDraft}
              onDeleted={() => navigate(user?.role === "admin" ? "/admin-dashboard" : "/blogs", { replace: true })}
            />
          </div>
        </div>

        {showSummary && (
          <div className="mt-8">
            <AISummary postId={post.id} onClose={() => setShowSummary(false)} />
          </div>
        )}

        <div className="article-body prose mt-10 max-w-none" dangerouslySetInnerHTML={{ __html: html }} />

        <footer className="mt-16 flex items-start gap-4 border-t border-line-strong pt-8">
          <Avatar name={post.author.name} src={post.author.avatar} size="md" />
          <div>
            <p className="kicker">Written by</p>
            <p className="mt-1.5 font-serif text-2xl font-medium tracking-[-0.01em] text-ink">{post.author.name}</p>
            {post.author.bio && <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-muted">{post.author.bio}</p>}
          </div>
        </footer>
      </article>
    </>
  );
}

function ArticleSkeleton() {
  return (
    <div role="status" aria-label="Loading story" className="animate-pulse">
      <div className="h-2.5 w-24 rounded-full bg-line" />
      <div className="mt-6 h-10 w-11/12 rounded bg-line" />
      <div className="mt-3 h-10 w-2/3 rounded bg-line" />
      <div className="mt-9 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-line" />
        <div className="space-y-2">
          <div className="h-3 w-32 rounded-full bg-line" />
          <div className="h-3 w-24 rounded-full bg-bone" />
        </div>
      </div>
      <div className="mt-12 space-y-3.5">
        {[100, 97, 93, 99, 72, 96, 90].map((w, i) => (
          <div key={i} className="h-3.5 rounded-full bg-bone" style={{ width: `${w}%` }} />
        ))}
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
