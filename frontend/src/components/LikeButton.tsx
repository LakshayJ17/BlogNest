import { Heart } from "lucide-react";
import { useState } from "react";

interface LikeButtonProps {
  liked: boolean;
  likes: number;
  onClick: () => void;
}

export const LikeButton = ({ liked, likes, onClick }: LikeButtonProps) => {
  const [popping, setPopping] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPopping(true);
    onClick();
    setTimeout(() => setPopping(false), 200); 
  };

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <button
        onClick={handleClick}
        aria-label={liked ? "Unlike post" : "Like post"}
        className="text-xl focus:outline-none cursor-pointer"
      >
        <Heart
          fill={liked ? "red" : "none"}
          color={liked ? "red" : "currentColor"}
          className={`w-5 h-5 transition-transform duration-200 ${
            popping ? "scale-125" : ""
          }`}
        />
      </button>
      <span>{likes} {likes === 1 ? "like" : "likes"}</span>
    </div>
  );
};
