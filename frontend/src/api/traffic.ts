import { get } from "@/api/client";
import type { TrafficBucketResponse } from "@/api/types";

export function fetchMyTraffic(days: number): Promise<TrafficBucketResponse[]> {
    return get<TrafficBucketResponse[]>(`/traffic/me?days=${days}`);
}