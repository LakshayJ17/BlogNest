import axios from 'axios';
import { create } from 'zustand'
import { BACKEND_URL } from '../config';

interface User {
    id: string;
    name: string;
    email: string;
    bio: string;
    googleId?: string;
    avatar?: string;
    joinedAt: string;
    posts: Array<{
        id: string;
        title: string;
        content: string;
        status: string;
        date: string;
        labels: string[];
        _count: {
            likes: number;
        }
    }>;
    likes: Array<{
        id: string;
        postId: string;
        createdAt: string;
    }>;
    role: string;
}

interface AuthState {
    token: string | null;
    setToken: (token: string) => void
    logout: () => void;
    user: User | null;
    setUser: (user: User) => void;
    fetchUserData: () => Promise<void>;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    token: localStorage.getItem('token'),

    setToken: (token) => {
        localStorage.setItem('token', token)
        set({ token })
    },

    logout: () => {
        localStorage.removeItem("token");
        set({ token: null, user: null });
    },

    user: null,

    setUser: (user) => {
        set({ user })
    },

    isLoading: false,

    setIsLoading: (loading) => {
        set({ isLoading: loading });
    },

    fetchUserData: async () => {
        const { token, setIsLoading } = get();
        if (!token) return;

        setIsLoading(true);
        try {
            const response = await axios.get(`${BACKEND_URL}/api/v1/user/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.status === 200) {
                const userData = response.data;
                set({ user: userData })
            } else{
                get().logout()
            }
        } catch(error){
            console.log("Error fetching user details : ", error)
            get().logout()
        } finally {
            setIsLoading(false);
        }
    },

}))