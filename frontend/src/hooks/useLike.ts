import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { api, getErrorMessage } from "../lib/api";
import { useAuthStore } from "../store/auth";

/**
 * Like state comes from the signed-in user's profile (likedPostIds), so no
 * per-post request is needed. Updates are optimistic and roll back on error.
 */
export const useLike = (postId: string, initialLikes: number, options?: { disabled?: boolean }) => {
  const user = useAuthStore((s) => s.user);
  const setLiked = useAuthStore((s) => s.setLiked);
  const [likes, setLikes] = useState(initialLikes);
  const [pending, setPending] = useState(false);

  useEffect(() => setLikes(initialLikes), [initialLikes]);

  const disabled = Boolean(options?.disabled) || user?.role === "admin";
  const liked = Boolean(user?.likedPostIds?.includes(postId));

  const toggleLike = async () => {
    if (disabled || pending) return;
    if (!user) {
      toast.info("Sign in to like stories.", { toastId: "like-signin" });
      return;
    }

    const next = !liked;
    setLiked(postId, next);
    setLikes((count) => Math.max(0, count + (next ? 1 : -1)));
    setPending(true);

    try {
      const { data } = await api.post<{ liked: boolean; likes: number }>(`/blog/${postId}/like`);
      setLiked(postId, data.liked);
      setLikes(data.likes);
    } catch (error) {
      setLiked(postId, !next);
      setLikes((count) => Math.max(0, count + (next ? -1 : 1)));
      toast.error(getErrorMessage(error, "Couldn't update your like."));
    } finally {
      setPending(false);
    }
  };

  return { liked, likes, toggleLike, disabled };
};
