import { create } from 'zustand'

interface AuthState {
    token : string | null;
    name : string | null;
    setToken: (token : string) => void;
    setName: (name : string) => void;
    logout: () => void;
    
}

export const useAuthStore = create<AuthState>((set) => ({
    token : localStorage.getItem('token'),
    name : localStorage.getItem('name'),

    setToken : (token) => {
        localStorage.setItem('token', token)
        set({token})
    },

    setName : (name) => {
        localStorage.setItem('name', name)
        set({name})
    },

    logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("name");
        set({ token: null, name: null });
    },

}))