import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../config";
import { toast } from "react-toastify";
import { useAuthStore } from "../store/auth";

export const useLike = (
  postId: string,
  initialLikes: number,
  options?: { disabled?: boolean }
) => {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const { token, user } = useAuthStore();

  const disabled = options?.disabled || user?.role === "admin";

  useEffect(() => {
    if (!token || !postId || disabled) return;

    axios
      .get(`${BACKEND_URL}/api/v1/blog/${postId}/liked`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setLiked(response.data.liked);
      })
      .catch((err) => {
        console.error("Failed to fetch liked status:", err);
        toast.error("Could not fetch like status 😿");
      });
  }, [postId, token, disabled]);

  const toggleLike = async () => {
    if (disabled) return;
    if (!token) {
      toast.error("Please sign in to like the post.");
      return;
    }

    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/v1/blog/${postId}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newLiked = res.data.liked;
      setLiked(newLiked);
      setLikes((prev) => (newLiked ? prev + 1 : prev - 1));
      toast.success(newLiked ? "You liked the post ❤️" : "You unliked the post 💔");
    } catch (err) {
      console.error("Failed to toggle like:", err);
      toast.error("An error occurred while liking the post.");
    }
  };

  return { liked, likes, toggleLike };
};
