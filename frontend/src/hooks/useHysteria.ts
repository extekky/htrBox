import { useQuery } from "@tanstack/react-query";
import { getOnlineUsers } from "@/api/hysteria";
import type { OnlineUsersResponse } from "@/api/types";

// -------------------------------------------------------------
// Ключи запросов
// -------------------------------------------------------------
export const HYSTERIA_KEYS = {
  online: ["online"] as const,
} as const;

/**
 * Возвращает список пользователей, подключённых в данный момент,
 * агрегированных по всем активным серверам Hysteria.
 * Polling каждые 30 с как fallback; WebSocket-событие `online_changed`
 * триггерит немедленную инвалидацию при наличии соединения.
 *
 * staleTime выровнен с refetchInterval — данные не пересчитываются
 * зря между плановыми обновлениями.
 *
 * retry: 1 — одна повторная попытка при ошибке (напр. нет активных серверов).
 * Без retry React Query по умолчанию делает 3 попытки с экспоненциальной
 * задержкой, что при поллинге создаёт очередь из зависших запросов.
 */
export function useOnlineUsers() {
  return useQuery<OnlineUsersResponse>({
    queryKey: HYSTERIA_KEYS.online,
    queryFn: getOnlineUsers,
    staleTime: 30_000,
    refetchInterval: 30_000,
    retry: 1,
  });
}
