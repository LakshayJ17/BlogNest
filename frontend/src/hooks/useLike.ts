import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../config";

export const useLike = (postId: string, initialLikes: number) => {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token || !postId) return;

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
      });
  }, [postId, token]);

  const toggleLike = async () => {
    if (!token) {
      alert("Please sign in to like the post.");
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
      console.log(newLiked)
      setLiked(newLiked);
      setLikes((prev) => (newLiked ? prev + 1 : prev - 1));
    } catch (err) {
      console.error("Failed to toggle like:", err);
    }
  };

  return { liked, likes, toggleLike };
};
