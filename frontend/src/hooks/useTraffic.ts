import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import type { TrafficBucketResponse } from "@/api/types";
import { fetchMyTraffic, fetchUserTraffic } from "@/api/traffic";

// -------------------------------------------------------------
// Константы
// -------------------------------------------------------------

// Интервал бакета в миллисекундах (5 минут)
const BUCKET_MS = 5 * 60 * 1000;

// -------------------------------------------------------------
// Типы
// -------------------------------------------------------------

export interface TrafficPoint {
  /** Unix timestamp (ms) */
  ts: number;
  /** Трафик за интервал в GB */
  delta_gb: number;
}

export interface UseTrafficResult {
  data: TrafficPoint[];
  totalGb: number;
  isLoading: boolean;
  isError: boolean;
}

export type TrafficDays = 1 | 2 | 3 | 4 | 5 | 6 | 7;

// -------------------------------------------------------------
// Хелперы
// -------------------------------------------------------------

/**
 * Заполняет пропуски в данных нулями.
 * API возвращает только бакеты с трафиком > 0, остальные нужно дорисовать.
 */
function fillBuckets(
  raw: TrafficBucketResponse[],
  days: number,
): TrafficPoint[] {
  const now = Date.now();
  const startMs = now - days * 24 * 60 * 60 * 1000;

  // Округляем до ближайшего 5-минутного бакета
  const startBucket = Math.ceil(startMs / BUCKET_MS) * BUCKET_MS;
  const endBucket = Math.floor(now / BUCKET_MS) * BUCKET_MS;

  // Индексируем сырые данные по округлённому timestamp
  const index = new Map<number, number>();
  for (const row of raw) {
    const ts = Math.round(new Date(row.time).getTime() / BUCKET_MS) * BUCKET_MS;
    index.set(ts, (index.get(ts) ?? 0) + row.delta_gb);
  }

  // Генерируем все бакеты подряд, подставляя 0 для пустых
  const result: TrafficPoint[] = [];
  for (let ts = startBucket; ts <= endBucket; ts += BUCKET_MS) {
    result.push({ ts, delta_gb: index.get(ts) ?? 0 });
  }

  return result;
}

// -------------------------------------------------------------
// Хук
// -------------------------------------------------------------

/**
 * Хук для получения трафика.
 * - Без `username` — возвращает трафик текущего авторизованного пользователя.
 * - С `username` — возвращает трафик конкретного пользователя (для админа).
 * - `days` может быть от 1 до 7 — период выборки.
 */
export function useTraffic(
  days: TrafficDays,
  username?: string,
): UseTrafficResult {
  const {
    data: raw,
    isLoading,
    isError,
  } = useQuery({
    queryKey: username
      ? ["traffic", "user", username, days]
      : ["traffic", "me", days],
    queryFn: () =>
      username ? fetchUserTraffic(username, days) : fetchMyTraffic(days),

    // Трафик меняется раз в 5 минут — кэшируем соответственно
    staleTime: BUCKET_MS,

    // Запрос с username не выполняется, пока имя не задано
    enabled: username !== undefined ? username.length > 0 : true,

    // Если юзера нет, API вернёт 404 — не нужно повторять запрос
    retry: username !== undefined ? false : undefined,
  });

  const data = useMemo(() => fillBuckets(raw ?? [], days), [raw, days]);

  const totalGb = useMemo(
    () => data.reduce((sum, p) => sum + p.delta_gb, 0),
    [data],
  );

  return { data, totalGb, isLoading, isError };
}
