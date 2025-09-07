import { Link } from "react-router-dom";
import { PostedDate } from "./PostedDate";
import { useLike } from "../hooks/useLike";
import { LikeButton } from "./LikeButton";
import { Ellipsis, Sparkle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { useAuthStore } from "../store/auth";
import { toast } from "react-toastify";

interface BlogCardProps {
  type: "draft" | "publish";
  id: string;
  author: {
    name: string;
    googleId?: string;
    avatar?: string;
    bio?: string;
    role: string;
  };
  authorId?: string;
  currentUserId?: string;
  title: string;
  content: string;
  publishedDate: string;
  _count: {
    likes: number;
  };
  labels?: string[];
  status: string;
  currentUserRole: string;
}

export const BlogCard = ({
  type,
  author,
  title,
  content,
  publishedDate,
  id,
  _count,
  labels,
  status,
  authorId,
  currentUserId,
  currentUserRole
}: BlogCardProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Disable like for admin users
  const { liked, likes, toggleLike } = useLike(id, _count.likes, { disabled: currentUserRole === "admin" });
  const minutes = Math.ceil(content.split(" ").length / 200);

  const linkto = status === "draft" ? `/publish/${id}` : `/blog/${id}`;
  const isOwnPost = authorId === currentUserId;

  // const [loading, setLoading] = useState(false);

  const { token } = useAuthStore();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const handleDelete = async (type : "blog" | "admin") => {
    setShowMenu(false);

    const res = await axios.delete(`${BACKEND_URL}/api/v1/${type}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (res.status === 200) {
      toast("Post deleted successfully")
    } else {
      toast("Error deleting post")
    }
  };

  const handleReport = async () => {
    setShowMenu(false);

    if (!token) {
      toast("You must be logged in to report a post");
      return;
    }

    try {
      const res = await axios.post(`${BACKEND_URL}/api/v1/blog/report/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.status === 200) {
        toast.success("Post reported successfully");
      } else {
        toast.error("Error reporting post");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Error reporting post");
    }
  };

  return (
    <div className="group p-6 rounded-lg border border-slate-200 bg-white hover:shadow-sm transition duration-200 shadow h-full flex flex-col">
      <div className="flex items-center text-xs text-slate-500 mb-2">
        <Avatar name={author.name} authorData={author} />
        <span className="ml-2">{author.name}</span>
        <div className="mx-2 h-1 w-1 bg-slate-400 rounded-full" />
        <PostedDate date={publishedDate} />
      </div>

      <Link to={linkto}>
        <div className="space-y-2">
          <div className="flex gap-5 items-center">
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-800">
              {title}
            </h2>
            {isOwnPost ? (
              <span className="bg-yellow-400 rounded-full px-3 flex justify-center items-center max-w-16 text-xs h-6">
                You
              </span>
            ) : (
              ""
            )}
          </div>

          <div className="flex flex-wrap gap-2 py-2">
            {Array.isArray(labels) &&
              labels.map((label) =>
                label === "AI Generated" ? (
                  <span
                    key={label}
                    className="bg-blue-100 border border-blue-400 text-blue-700 font-semibold py-1 px-3 rounded-full flex items-center gap-1 text-xs select-none"
                  >
                    <Sparkle size={15} className="text-blue-500" />
                    {label}
                  </span>
                ) : (
                  <span
                    key={label}
                    className="bg-neutral-100 border border-neutral-200 text-gray-700 py-1 px-3 rounded-full flex items-center gap-1 text-xs"
                  >
                    {label}
                  </span>
                )
              )}
          </div>
          <p
            className="text-sm text-slate-600 leading-snug line-clamp-2 prose"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          <p className="text-xs text-slate-400 pt-1">
            {minutes} {minutes > 1 ? "mins read" : "min read"}
          </p>
        </div>
      </Link>

      {type === "publish" ? (
        <div className="flex items-baseline gap-10 mt-5">
          <div>
            <LikeButton liked={liked} likes={likes} onClick={toggleLike} />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowMenu((prev) => !prev)}
              aria-label="More options"
              className="p-1 rounded-sm hover:bg-gray-100 bottom-0"
            >
              <Ellipsis />
            </button>

            {showMenu && (
              <div
                ref={menuRef}
                className="absolute top-1/2 left-full -translate-y-1/2 ml-2 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-20 flex flex-col py-2"
                style={{ minWidth: "8rem" }}
              >
                {(isOwnPost || currentUserRole === "admin") ? (
                  <button
                    className="px-4 py-2 text-left hover:bg-red-50 text-red-600 transition-colors rounded-md"
                    onClick={() => {
                      console.log("Delete clicked")

                      handleDelete(currentUserRole === "admin" ? "admin" : "blog")
                    }}
                  >
                    Delete
                  </button>
                ) : (
                  <button
                    className="px-4 py-2 text-left hover:bg-yellow-50 text-yellow-600 transition-colors rounded-md"
                    onClick={() => handleReport()}
                  >
                    Report
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export function Avatar({
  name,
  size = "small",
  authorData,
}: {
  name: string;
  size?: "small" | "big";
  authorData?: {
    googleId?: string;
    avatar?: string;
  } | null;
}) {
  const sizeClasses =
    size === "small" ? "w-6 h-6 text-sm" : "w-10 h-10 text-lg";

  return (
    <>
      {authorData?.googleId ? (
        <img
          src={authorData.avatar}
          alt={name}
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          className={`rounded-full object-cover ${sizeClasses}`}
        />
      ) : (
        <div
          className={`inline-flex items-center justify-center rounded-full bg-gray-800 text-white font-semibold ${sizeClasses}`}
          style={{ lineHeight: 1 }}
        >
          {name.trim()[0].toUpperCase()}
        </div>
      )}
    </>
  );
}
