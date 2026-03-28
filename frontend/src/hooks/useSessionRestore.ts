import { useEffect, useState } from "react";
import { useLocation } from "wouter";

import { refreshToken, getMe } from "@/api/auth";
import { useAuthStore } from "@/stores/authStore";
import { initServerData } from "@/hooks/useServers";
import { queryClient } from "@/queryClient";
import { USER_KEYS } from "@/hooks/useUsers";

// Максимальное время ожидания восстановления сессии перед тем, как показать экран логина
const RESTORE_TIMEOUT_MS = 5_000;

/**
 * Хук для автоматического восстановления сессии пользователя при загрузке приложения.
 * 
 * Логика работы:
 * - Пытается обновить access_token через refresh_token (HttpOnly cookie).
 * - В случае успеха запрашивает данные профиля текущего пользователя.
 * - Для обычных пользователей инициализирует данные серверов (ключи подключения).
 * - Выполняет автоматический редирект в зависимости от роли (админ или пользователь).
 * - Управляет состоянием `restoring` для отображения загрузочного экрана (Splash Screen).
 * 
 * Безопасность:
 * - Использует флаг `cancelled` для предотвращения обновления состояния размонтированного компонента.
 * - Ограничен таймаутом, чтобы пользователь не "завис" на экране загрузки при сетевых сбоях.
 */
export function useSessionRestore(): { restoring: boolean } {
    // Флаг процесса восстановления — пока true, приложение показывает Splash Screen
    const [restoring, setRestoring] = useState(true);

    const setAuth = useAuthStore((s) => s.setAuth);
    const setToken = useAuthStore((s) => s.setToken);
    const [, navigate] = useLocation();

    useEffect(() => {
        // Страж для предотвращения race conditions при размонтировании
        let cancelled = false;

        // Резервный таймаут: если восстановление затянется, принудительно снимаем флаг загрузки
        const timeout = setTimeout(() => {
            if (!cancelled) setRestoring(false);
        }, RESTORE_TIMEOUT_MS);

        /**
         * Основная асинхронная функция восстановления сессии.
         */
        async function restore() {
            try {
                // Пытаемся получить новый access_token
                const tokenResponse = await refreshToken();
                if (cancelled) return;

                // Временно сохраняем токен для последующих запросов (getMe, initServerData)
                setToken(tokenResponse.access_token);

                // Получаем данные профиля пользователя
                const user = await getMe();
                if (cancelled) return;

                if (!user) {
                    setRestoring(false);
                    return;
                }

                // Предзаполняем кэш TanStack Query данными пользователя
                queryClient.setQueryData(USER_KEYS.me, user);

                // Если пользователь не админ — инициализируем ключи серверов
                if (user.role !== "admin" && user.active) {
                    await initServerData(user.username);
                    if (cancelled) return;
                }

                // Финализируем авторизацию в глобальном сторе
                setAuth(tokenResponse.access_token, user);

                // Перенаправляем пользователя в соответствующий раздел
                navigate(user.role === "admin" ? "/admin" : "/profile");
            } catch {
                // При любой ошибке (например, 401 Unauthorized) просто прекращаем восстановление
                if (!cancelled) setRestoring(false);
            } finally {
                // Очищаем резервный таймаут и снимаем флаг загрузки
                clearTimeout(timeout);
                if (!cancelled) setRestoring(false);
            }
        }

        // Запускаем процесс восстановления на следующем тике события
        const initTimer = setTimeout(() => {
            if (!cancelled) restore();
        }, 0);

        // Очистка при размонтировании: отменяем все таймеры и выставляем флаг отмены
        return () => {
            cancelled = true;
            clearTimeout(timeout);
            clearTimeout(initTimer);
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return { restoring };
}
