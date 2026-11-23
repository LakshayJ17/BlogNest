import { Link } from "react-router-dom";
import { PencilSimpleLine } from "@phosphor-icons/react";
import type { Author, PostPreview } from "../lib/types";
import { useLike } from "../hooks/useLike";
import { useAuthStore } from "../store/auth";
import { Avatar } from "./Avatar";
import { StoryKicker } from "./Labels";
import { LikeButton } from "./LikeButton";
import { PostedDate } from "./PostedDate";
import { PostMenu } from "./PostMenu";
import { buttonClasses } from "./ui/button";
import { cn } from "../lib/utils";

interface BlogCardProps {
  post: PostPreview;
  /** Override the author shown (e.g. on the profile page). */
  author?: Author;
  onDeleted?: (id: string) => void;
  className?: string;
}

/** A story in a list: kicker, serif headline, excerpt, byline. Separated by hairlines, not boxes. */
export const BlogCard = ({ post, author, onDeleted, className }: BlogCardProps) => {
  const user = useAuthStore((s) => s.user);
  const isDraft = post.status === "draft";
  const by = author ?? post.author ?? { name: "Anonymous" };
  const isOwn = Boolean(user && post.authorId && user.id === post.authorId);
  const href = isDraft ? `/publish/${post.id}` : `/blog/${post.id}`;
  const { liked, likes, toggleLike, disabled } = useLike(post.id, post._count.likes, { disabled: isDraft });

  return (
    <article className={cn("group relative py-8", className)}>
      <div className="flex min-h-5 items-center gap-3">
        {isDraft && (
          <span className="rounded-full bg-tag-teal-bg px-2 py-0.5 font-mono text-[10px] font-medium tracking-[0.08em] text-tag-teal uppercase">
            Draft
          </span>
        )}
        <StoryKicker labels={post.labels} />
        {isOwn && !isDraft && <span className="font-mono text-[11px] text-faint">Your story</span>}
      </div>

      <h2 className="mt-2.5 font-serif text-[1.5rem] font-semibold leading-[1.2] tracking-[-0.015em] text-ink sm:text-[1.75rem]">
        <Link to={href} className="link-draw focus-ring rounded-sm after:absolute after:inset-0">
          {post.title}
        </Link>
      </h2>

      {post.excerpt && (
        <p className="mt-2.5 line-clamp-2 font-serif text-[1.0625rem] leading-relaxed text-muted">{post.excerpt}</p>
      )}

      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5 text-[13px]">
          {!isDraft && (
            <>
              <Avatar name={by.name} src={by.avatar} size="xs" />
              <span className="truncate font-medium text-ink-soft">{by.name}</span>
            </>
          )}
          <span className="shrink-0 font-mono text-xs text-muted">
            <PostedDate date={post.date} />
            <span aria-hidden="true" className="mx-1.5 text-faint">
              /
            </span>
            {post.readingMinutes} min
          </span>
        </div>

        <div className="relative z-10 flex shrink-0 items-center gap-0.5">
          {isDraft ? (
            <Link to={href} className={buttonClasses({ variant: "ghost", size: "sm" })}>
              <PencilSimpleLine size={16} aria-hidden="true" />
              Continue editing
            </Link>
          ) : (
            <LikeButton liked={liked} likes={likes} onClick={toggleLike} disabled={disabled} />
          )}
          <PostMenu postId={post.id} authorId={post.authorId} isDraft={isDraft} onDeleted={onDeleted} />
        </div>
      </div>
    </article>
  );
};

/** Compact row for the landing page's front-page list. */
export const StoryRow = ({ post, index }: { post: PostPreview; index: number }) => (
  <article className="group relative grid grid-cols-[2rem_1fr] gap-x-3 py-5">
    <span className="pt-1 font-mono text-xs text-faint tabular-nums">{String(index + 1).padStart(2, "0")}</span>
    <div className="min-w-0">
      <StoryKicker labels={post.labels} />
      <h3 className="mt-1.5 font-serif text-[1.25rem] font-semibold leading-snug tracking-[-0.01em] text-ink">
        <Link to={`/blog/${post.id}`} className="link-draw focus-ring rounded-sm after:absolute after:inset-0">
          {post.title}
        </Link>
      </h3>
      <p className="mt-1.5 text-[13px] text-muted">
        {post.author?.name ?? "Anonymous"}
        <span aria-hidden="true" className="mx-1.5 text-faint">
          /
        </span>
        <span className="font-mono text-xs">{post.readingMinutes} min</span>
      </p>
    </div>
  </article>
);
