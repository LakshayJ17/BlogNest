import { Heart } from "@phosphor-icons/react";
import { cn } from "../lib/utils";

interface LikeButtonProps {
  liked: boolean;
  likes: number;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export const LikeButton = ({ liked, likes, onClick, disabled, className }: LikeButtonProps) => {
  const count = `${likes} ${likes === 1 ? "like" : "likes"}`;

  if (disabled) {
    return (
      <span className={cn("inline-flex items-center gap-1.5 font-mono text-xs text-muted", className)}>
        <Heart size={16} aria-hidden="true" />
        {likes}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={liked}
      aria-label={`${liked ? "Unlike" : "Like"} this story, ${count}`}
      className={cn(
        "focus-ring group/like relative z-10 inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md px-2 font-mono text-xs tabular-nums transition-colors",
        liked ? "text-tag-red hover:bg-tag-red-bg" : "text-muted hover:bg-bone hover:text-ink",
        className
      )}
    >
      <Heart
        size={17}
        weight={liked ? "fill" : "regular"}
        aria-hidden="true"
        className="transition-transform duration-200 group-active/like:scale-125"
      />
      {likes}
    </button>
  );
};
