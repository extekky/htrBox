import { create } from "zustand";
import { refreshToken as refreshTokenApi } from "@/api/auth";
import { useServerStore } from "@/stores/serverStore";
import type { UserSessionInfo } from "@/api/types";

// -------------------------------------------------------------
// Типы
// -------------------------------------------------------------

interface AuthState {
    // JWT access-токен текущей сессии
    token: string | null;

    // Профиль и данные сессии авторизованного пользователя
    user: UserSessionInfo | null;

    // Текущий in-flight запрос на обновление токена.
    // Хранится чтобы не дублировать параллельные refresh-запросы.
    _refreshPromise: Promise<string | null> | null;

    setAuth: (token: string, user: UserSessionInfo) => void;
    setToken: (token: string) => void;
    setUser: (user: UserSessionInfo) => void;
    clearAuth: () => void;
    refreshToken: () => Promise<string | null>;
}

// -------------------------------------------------------------
// Стор
// -------------------------------------------------------------

export const useAuthStore = create<AuthState>((set, get) => ({
    token: null,
    user: null,
    _refreshPromise: null,

    /**
     * Установить токен и пользователя одновременно.
     * Вызывается после успешного логина.
     */
    setAuth: (token, user) => set({ token, user }),

    /**
     * Обновить только access-токен (например после refresh).
     */
    setToken: (token) => set({ token }),

    /**
     * Обновить данные профиля пользователя без затрагивания токена.
     */
    setUser: (user) => set({ user }),

    /**
     * Полностью сбросить состояние авторизации.
     * Также очищает серверные данные из serverStore.
     */
    clearAuth: () => {
        set({ token: null, user: null, _refreshPromise: null });
        useServerStore.getState().clearServer();
    },

    /**
     * Обновить access-токен через refresh-токен (из cookie).
     * Если обновление уже выполняется — возвращает тот же промис,
     * чтобы не дублировать параллельные запросы.
     * При ошибке сбрасывает авторизацию и возвращает null.
     */
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

// -------------------------------------------------------------
// Селекторы
// -------------------------------------------------------------

// Используются для подписки на конкретное поле стора
// без лишних ре-рендеров: useAuthStore(selectToken)

export const selectToken           = (s: AuthState) => s.token;
export const selectUser            = (s: AuthState) => s.user;
export const selectRole            = (s: AuthState) => s.user?.role ?? null;
export const selectIsAdmin         = (s: AuthState) => s.user?.role === "admin";
export const selectIsAuthenticated = (s: AuthState) => s.token !== null && s.user !== null;