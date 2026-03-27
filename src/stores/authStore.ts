import { create } from "zustand";
import { refreshToken as refreshTokenApi } from "@/api/auth";
import { useServerStore } from "@/stores/serverStore";
import type { UserSessionInfo } from "@/api/types";

interface AuthState {
    token: string | null;
    user: UserSessionInfo | null;
    _refreshPromise: Promise<string | null> | null;

    setAuth: (token: string, user: UserSessionInfo) => void;
    setToken: (token: string) => void;
    setUser: (user: UserSessionInfo) => void;
    clearAuth: () => void;
    refreshToken: () => Promise<string | null>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    token: null,
    user: null,
    _refreshPromise: null,

    setAuth: (token, user) => set({ token, user }),
    setToken: (token) => set({ token }),
    setUser: (user) => set({ user }),

    clearAuth: () => {
        set({ token: null, user: null, _refreshPromise: null });
        useServerStore.getState().clearServer();
    },

    refreshToken: async () => {
        const existing = get()._refreshPromise;
        if (existing) return existing;

        const promise = refreshTokenApi()
            .then((data) => {
                set({ token: data.access_token });
                return data.access_token;
            })
            .catch(() => {
                get().clearAuth();
                return null;
            })
            .finally(() => set({ _refreshPromise: null }));

        set({ _refreshPromise: promise });
        return promise;
    },
}));

// Selectors
export const selectToken = (s: AuthState) => s.token;
export const selectUser = (s: AuthState) => s.user;
export const selectRole = (s: AuthState) => s.user?.role ?? null;
export const selectIsAdmin = (s: AuthState) => s.user?.role === "admin";
export const selectIsAuthenticated = (s: AuthState) => s.token !== null && s.user !== null;