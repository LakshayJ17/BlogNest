import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Notebook, NotePencil } from "@phosphor-icons/react";
import { useAuthStore } from "../store/auth";
import { PageShell } from "../components/PageShell";
import { Avatar } from "../components/Avatar";
import { BlogCard } from "../components/BlogCard";
import { EmptyState } from "../components/EmptyState";
import { buttonClasses } from "../components/ui/button";
import { cn } from "../lib/utils";

type Tab = "published" | "draft";

export const ProfilePage = () => {
  const user = useAuthStore((s) => s.user);
  const fetchUserData = useAuthStore((s) => s.fetchUserData);
  const [tab, setTab] = useState<Tab>("published");

  // Refresh so counts and lists reflect recent edits.
  useEffect(() => {
    void fetchUserData();
  }, [fetchUserData]);

  if (!user) return null;

  const published = user.posts.filter((p) => p.status === "published");
  const drafts = user.posts.filter((p) => p.status === "draft");
  const likesReceived = published.reduce((sum, p) => sum + p._count.likes, 0);
  const visible = tab === "published" ? published : drafts;
  const author = { name: user.name, avatar: user.avatar, bio: user.bio };
  const joined = new Date(user.joinedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const stats = [
    { label: "Published", value: published.length },
    { label: "Drafts", value: drafts.length },
    { label: "Likes received", value: likesReceived },
  ];

  return (
    <PageShell>
      <Helmet>
        <title>{`${user.name} | BlogNest`}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <section className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <Avatar name={user.name} src={user.avatar} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="kicker">Writer since {joined}</p>
          <h1 className="mt-2 break-words font-serif text-[2.5rem] font-medium leading-[1.08] tracking-[-0.025em] text-ink">
            {user.name}
          </h1>
          <p className="mt-1 break-words font-mono text-xs text-muted">{user.email}</p>
          {user.bio && <p className="mt-4 max-w-xl font-serif text-lg leading-relaxed text-ink-soft">{user.bio}</p>}
        </div>
      </section>

      <dl className="mt-10 grid grid-cols-3 divide-x divide-line border-y border-line">
        {stats.map((stat) => (
          <div key={stat.label} className="px-4 py-5 first:pl-0">
            <dt className="font-mono text-[11px] tracking-[0.12em] text-muted uppercase">{stat.label}</dt>
            <dd className="mt-1.5 font-serif text-3xl font-medium text-ink tabular-nums">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-14" aria-labelledby="stories-heading">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line">
          <h2 id="stories-heading" className="sr-only">
            Your stories
          </h2>
          <div role="tablist" aria-label="Story status" className="flex gap-6">
            {(["published", "draft"] as const).map((value) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={tab === value}
                onClick={() => setTab(value)}
                className={cn(
                  "focus-ring -mb-px cursor-pointer border-b-2 pb-3 text-sm transition-colors",
                  tab === value ? "border-accent font-medium text-ink" : "border-transparent text-muted hover:text-ink"
                )}
              >
                {value === "published" ? "Published" : "Drafts"}
                <span className="ml-1.5 font-mono text-xs text-faint">
                  {value === "published" ? published.length : drafts.length}
                </span>
              </button>
            ))}
          </div>
          <Link to="/publish" className={buttonClasses({ variant: "ghost", size: "sm", className: "mb-2" })}>
            <NotePencil size={16} aria-hidden="true" />
            New story
          </Link>
        </div>

        <div role="tabpanel">
          {visible.length === 0 ? (
            <EmptyState
              className="border-t-0"
              icon={tab === "published" ? NotePencil : Notebook}
              title={tab === "published" ? "Nothing published yet" : "No drafts"}
              description={
                tab === "published" ? "Stories you publish show up here." : "Drafts you save show up here."
              }
              action={
                <Link to="/publish" className={buttonClasses()}>
                  Write a story
                </Link>
              }
            />
          ) : (
            <div className="divide-y divide-line border-b border-line">
              {visible.map((post) => (
                <BlogCard key={post.id} post={{ ...post, authorId: user.id }} author={author} />
              ))}
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
};
