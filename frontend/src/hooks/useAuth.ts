import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { logout } from "@/api/auth";
import { useAuthStore } from "@/stores/authStore";
import { queryClient } from "@/queryClient";

// -------------------------------------------------------------
// useLogout — мутация выхода из системы
// -------------------------------------------------------------

interface UseLogoutOptions {
  onSuccess?: () => void;
}

/**
 * Хук-мутация для выхода пользователя из системы.
 * После завершения (успех или ошибка): всегда очищает auth store,
 * сбрасывает весь кэш запросов и перенаправляет на страницу входа.
 * Выход считается успешным даже при ошибке серверного запроса.
 */
export function useLogout({ onSuccess }: UseLogoutOptions = {}) {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [, navigate] = useLocation();

  return useMutation<{ ok: boolean }, unknown, void>({
    mutationFn: () => logout(),

    onSettled: () => {
      // Всегда очищаем всё независимо от ответа сервера
      clearAuth();
      queryClient.clear(); // удаляет все кэшированные данные -> свежий fetch при следующем входе
      navigate("/login");

      // Опциональный колбэк (например, показать тост "Вы вышли из системы")
      onSuccess?.();
    },

    // Повторные попытки не нужны — если сервер недоступен, выходим локально
    retry: false,
  });
}
