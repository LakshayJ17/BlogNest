import { create } from "zustand";
import { toast } from "react-toastify";
import { api, isStatus, onUnauthorized } from "../lib/api";
import { clearToken, readToken, writeToken } from "../lib/session";
import type { User } from "../lib/types";

interface AuthState {
  token: string | null;
  user: User | null;
  /** True while the signed-in user's profile is loading. */
  isLoading: boolean;
  setToken: (token: string) => void;
  logout: () => void;
  fetchUserData: () => Promise<void>;
  setLiked: (postId: string, liked: boolean) => void;
}

const initialToken = readToken();

export const useAuthStore = create<AuthState>((set, get) => ({
  token: initialToken,
  user: null,
  // Start in the loading state when a token exists, so guarded routes don't
  // redirect before we know who the user is.
  isLoading: Boolean(initialToken),

  setToken: (token) => {
    writeToken(token);
    set({ token });
  },

  logout: () => {
    clearToken();
    set({ token: null, user: null, isLoading: false });
  },

  fetchUserData: async () => {
    if (!get().token) {
      set({ isLoading: false });
      return;
    }

    set({ isLoading: true });
    try {
      const { data } = await api.get<User>("/user/me");
      set({ user: data });
    } catch (error) {
      if (isStatus(error, 401) || isStatus(error, 403) || isStatus(error, 404)) {
        get().logout();
      } else {
        // Network trouble: keep the token so a reload can recover.
        toast.error("Couldn't load your account. Check your connection and refresh.", {
          toastId: "me-failed",
        });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  setLiked: (postId, liked) => {
    const user = get().user;
    if (!user) return;
    const ids = new Set(user.likedPostIds);
    if (liked) ids.add(postId);
    else ids.delete(postId);
    set({ user: { ...user, likedPostIds: [...ids] } });
  },
}));

onUnauthorized(() => {
  const { token, logout } = useAuthStore.getState();
  if (!token) return;
  logout();
  toast.info("Your session has expired. Please sign in again.", { toastId: "session-expired" });
});
