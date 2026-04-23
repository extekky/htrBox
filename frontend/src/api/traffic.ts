import { get } from "@/api/client";
import type { TrafficBucketResponse } from "@/api/types";

/**
 * Получает трафик текущего пользователя за указанный период.
 * - `days` может быть 1, 2 или 3 — это параметр API для выбора периода.
 * - Возвращает массив бакетов с трафиком за 5-минутные интервалы.
 */
export function fetchMyTraffic(days: number): Promise<TrafficBucketResponse[]> {
  return get<TrafficBucketResponse[]>(`/traffic/me?days=${days}`);
}

/**
 * Получает трафик конкретного пользователя за указанный период.
 * - `username` — имя пользователя.
 * - `days` может быть 1, 2 или 3 — это параметр API для выбора периода.
 * - Возвращает массив бакетов с трафиком за 5-минутные интервалы.
 */
export function fetchUserTraffic(
  username: string,
  days: number,
): Promise<TrafficBucketResponse[]> {
  return get<TrafficBucketResponse[]>(
    `/traffic/user/${encodeURIComponent(username)}?days=${days}`,
  );
}
