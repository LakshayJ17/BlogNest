import { Heart } from "lucide-react";
import { useState } from "react";

interface LikeButtonProps {
  liked: boolean;
  likes: number;
  onClick: () => void;
}

export const LikeButton = ({ liked, likes, onClick }: LikeButtonProps) => {
  const [animating, setAnimating] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAnimating(true);
    onClick();
    setTimeout(() => setAnimating(false), 200); 
  };

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <button
        onClick={handleClick}
        aria-label={liked ? "Unlike post" : "Like post"}
        className="focus:outline-none"
      >
        <Heart
          fill={liked ? "#ef4444" : "none"} 
          color={liked ? "#ef4444" : "currentColor"}
          className={`w-6 h-6 transition-all duration-300 ease-in-out 
            ${animating ? "scale-125" : "scale-100"} 
            ${liked ? "drop-shadow-md" : ""}
          `}
        />
      </button>
      <span>{likes} {likes === 1 ? "like" : "likes"}</span>
    </div>
  );
};
