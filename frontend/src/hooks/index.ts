import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { api, getErrorMessage, isStatus } from "../lib/api";
import type { Post, PostPreview } from "../lib/types";

type LoadStatus = "loading" | "ready" | "error";

interface FeedResponse {
  posts: PostPreview[];
  page: number;
  hasMore: boolean;
}

interface FeedOptions {
  q?: string;
  label?: string;
  sort?: "latest" | "popular";
  limit?: number;
}

/** Paginated public feed. Ignores responses from superseded searches. */
export function useBlogs({ q, label, sort = "latest", limit = 12 }: FeedOptions = {}) {
  const [posts, setPosts] = useState<PostPreview[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [error, setError] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const params = { q: q?.trim() || undefined, label: label || undefined, sort, limit };

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");

    api
      .get<FeedResponse>("/blog/bulk", { params: { ...params, page: 1 }, signal: controller.signal })
      .then(({ data }) => {
        setPosts(data.posts);
        setPage(1);
        setHasMore(data.hasMore);
        setStatus("ready");
      })
      .catch((err) => {
        if (axios.isCancel(err)) return;
        setError(getErrorMessage(err, "Couldn't load stories."));
        setStatus("error");
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.q, params.label, sort, limit, reloadKey]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const { data } = await api.get<FeedResponse>("/blog/bulk", { params: { ...params, page: page + 1 } });
      setPosts((current) => {
        const seen = new Set(current.map((p) => p.id));
        return [...current, ...data.posts.filter((p) => !seen.has(p.id))];
      });
      setPage(data.page);
      setHasMore(data.hasMore);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't load more stories."));
    } finally {
      setLoadingMore(false);
    }
  };

  const removePost = useCallback((id: string) => {
    setPosts((current) => current.filter((p) => p.id !== id));
  }, []);

  return {
    posts,
    status,
    error,
    hasMore,
    loadingMore,
    loadMore,
    removePost,
    retry: () => setReloadKey((k) => k + 1),
  };
}

export function useBlog(id: string | undefined) {
  const [post, setPost] = useState<Post | null>(null);
  const [status, setStatus] = useState<LoadStatus | "notFound">("loading");
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!id) {
      setStatus("notFound");
      return;
    }
    const controller = new AbortController();
    setStatus("loading");

    api
      .get<{ post: Post }>(`/blog/${encodeURIComponent(id)}`, { signal: controller.signal })
      .then(({ data }) => {
        setPost(data.post);
        setStatus("ready");
      })
      .catch((err) => {
        if (axios.isCancel(err)) return;
        if (isStatus(err, 404)) {
          setStatus("notFound");
        } else {
          setError(getErrorMessage(err, "Couldn't load this story."));
          setStatus("error");
        }
      });

    return () => controller.abort();
  }, [id, reloadKey]);

  return { post, status, error, retry: () => setReloadKey((k) => k + 1) };
}

export function useDrafts() {
  const [drafts, setDrafts] = useState<PostPreview[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");

    api
      .get<{ drafts: PostPreview[] }>("/blog/drafts", { signal: controller.signal })
      .then(({ data }) => {
        setDrafts(data.drafts);
        setStatus("ready");
      })
      .catch((err) => {
        if (axios.isCancel(err)) return;
        setError(getErrorMessage(err, "Couldn't load your drafts."));
        setStatus("error");
      });

    return () => controller.abort();
  }, [reloadKey]);

  const removeDraft = useCallback((id: string) => {
    setDrafts((current) => current.filter((d) => d.id !== id));
  }, []);

  return { drafts, status, error, removeDraft, retry: () => setReloadKey((k) => k + 1) };
}

/** Debounce a fast-changing value, e.g. a search box. */
export function useDebounced<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
