import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import type { TrafficBucketResponse } from "@/api/types";
import { 
    fetchMyTraffic, 
    fetchUserTraffic,
} from "@/api/traffic";

// Интервал бакета в миллисекундах (5 минут)
const BUCKET_MS = 5 * 60 * 1000;

export interface TrafficPoint {
    /** Unix timestamp (ms) */
    ts: number;
    /** Трафик за интервал в GB */
    delta_gb: number;
}

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

export interface UseTrafficResult {
    data: TrafficPoint[];
    totalGb: number;
    isLoading: boolean;
    isError: boolean;
}

/**
 * Хук для получения трафика текущего пользователя.
 * - `days` может быть 1, 2 или 3 — это параметр API для выбора периода.
 * - Возвращает данные, общую сумму трафика и статусы загрузки/ошибки.
 */
export function useTraffic(days: 1 | 2 | 3): UseTrafficResult {
    const { data: raw, isLoading, isError } = useQuery({
        queryKey: ["traffic", "me", days],
        queryFn: () => fetchMyTraffic(days),
        // Трафик меняется раз в 5 минут — кэшируем соответственно
        staleTime: BUCKET_MS,
    });

    const data = useMemo(
        () => fillBuckets(raw ?? [], days),
        [raw, days],
    );

    const totalGb = useMemo(
        () => data.reduce((sum, p) => sum + p.delta_gb, 0),
        [data],
    );

    return { data, totalGb, isLoading, isError };
}

/**
 * Хук для получения трафика конкретного пользователя.
 * Отличается от `useTraffic` только API-эндпоинтом и ключом кэша.
 */
export function useUserTraffic(username: string, days: 1 | 2 | 3): UseTrafficResult {
    const { data: raw, isLoading, isError } = useQuery({
        queryKey: ["traffic", "user", username, days],
        queryFn: () => fetchUserTraffic(username, days),
        staleTime: BUCKET_MS,
        enabled: !!username,
        retry: false, // Если юзера нет, API вернёт 404 — не нужно повторять запрос
    });

    // Остальная логика идентична — заполняем пропуски и считаем сумму
    const data = useMemo(
        () => fillBuckets(raw ?? [], days),
        [raw, days],
    );

    // Считаем общую сумму трафика за период
    const totalGb = useMemo(
        () => data.reduce((sum, p) => sum + p.delta_gb, 0),
        [data],
    );

    return { data, totalGb, isLoading, isError };
}