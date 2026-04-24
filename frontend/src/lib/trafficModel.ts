import type { TrafficPoint } from "@/hooks/useTraffic";

const MIN_POINT_BUDGET = 96;
const MAX_POINT_BUDGET = 1400;
const DEFAULT_POINT_BUDGET = 320;
const POINTS_PER_PIXEL = 1;

const X_TICK_INTERVALS_MS = [
  30 * 60 * 1000,
  60 * 60 * 1000,
  2 * 60 * 60 * 1000,
  3 * 60 * 60 * 1000,
  4 * 60 * 60 * 1000,
  6 * 60 * 60 * 1000,
  8 * 60 * 60 * 1000,
  12 * 60 * 60 * 1000,
  24 * 60 * 60 * 1000,
  48 * 60 * 60 * 1000,
] as const;

export interface ChartPadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ChartFrame {
  width: number;
  height: number;
  padding: ChartPadding;
}

export interface ChartPoint extends TrafficPoint {
  x: number;
  y: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function niceStep(rawStep: number): number {
  if (!Number.isFinite(rawStep) || rawStep <= 0) return 1;

  const exponent = Math.floor(Math.log10(rawStep));
  const magnitude = 10 ** exponent;
  const fraction = rawStep / magnitude;

  if (fraction <= 1) return 1 * magnitude;
  if (fraction <= 2) return 2 * magnitude;
  if (fraction <= 5) return 5 * magnitude;
  return 10 * magnitude;
}

export function getPointBudget(widthPx: number, devicePixelRatio = 1): number {
  if (widthPx <= 0) return DEFAULT_POINT_BUDGET;
  const dpr = clamp(devicePixelRatio || 1, 1, 2);
  const budget = Math.round(widthPx * dpr * POINTS_PER_PIXEL);
  return clamp(budget, MIN_POINT_BUDGET, MAX_POINT_BUDGET);
}

/**
 * Downsample по min/max внутри бакетов.
 * Сохраняет форму графика, пики и просадки при ограниченном бюджете точек.
 */
export function downsampleTraffic(
  data: TrafficPoint[],
  pointBudget: number,
): TrafficPoint[] {
  if (data.length <= pointBudget || pointBudget < 3) return data;

  const first = data[0];
  const last = data[data.length - 1];
  const inner = data.slice(1, -1);
  const sampled: TrafficPoint[] = [first];

  const innerBudget = pointBudget - 2;
  const bucketCount = Math.max(1, Math.ceil(innerBudget / 2));
  const bucketSize = Math.ceil(inner.length / bucketCount);

  for (let bucket = 0; bucket < bucketCount; bucket++) {
    const start = bucket * bucketSize;
    const end = Math.min(start + bucketSize, inner.length);
    if (start >= end) break;

    let minIdx = start;
    let maxIdx = start;

    for (let i = start + 1; i < end; i++) {
      if (inner[i].delta_gb < inner[minIdx].delta_gb) minIdx = i;
      if (inner[i].delta_gb > inner[maxIdx].delta_gb) maxIdx = i;
    }

    const firstIdx = Math.min(minIdx, maxIdx);
    const secondIdx = Math.max(minIdx, maxIdx);

    if (sampled.length < pointBudget - 1) sampled.push(inner[firstIdx]);
    if (secondIdx !== firstIdx && sampled.length < pointBudget - 1) {
      sampled.push(inner[secondIdx]);
    }
  }

  sampled.push(last);
  return sampled;
}

export function smoothTraffic(
  data: TrafficPoint[],
  radius = 2,
): TrafficPoint[] {
  if (radius <= 0 || data.length < 3) return data;

  return data.map((point, i) => {
    const start = Math.max(0, i - radius);
    const end = Math.min(data.length - 1, i + radius);

    let sum = 0;
    let count = 0;

    for (let j = start; j <= end; j++) {
      const weight = radius + 1 - Math.abs(j - i);
      sum += data[j].delta_gb * weight;
      count += weight;
    }

    return { ...point, delta_gb: sum / count };
  });
}

export function buildYScale(
  maxValue: number,
  tickCount = 5,
): {
  domainMax: number;
  ticks: number[];
} {
  const safeMax = Number.isFinite(maxValue) && maxValue > 0 ? maxValue : 0.001;
  const step = niceStep(safeMax / Math.max(1, tickCount - 1));
  const domainMax = Math.max(step, Math.ceil(safeMax / step) * step);

  const ticks: number[] = [];
  for (let value = 0; value <= domainMax + step * 0.5; value += step) {
    ticks.push(Number(value.toFixed(6)));
  }

  if (ticks.length < 2) {
    ticks.push(domainMax);
  }

  return { domainMax, ticks };
}

export function buildXTicks(data: TrafficPoint[], widthPx: number): number[] {
  if (data.length < 2) return data.length ? [data[0].ts] : [];

  const first = data[0].ts;
  const last = data[data.length - 1].ts;
  const spanMs = Math.max(1, last - first);

  const targetTickCount = clamp(Math.floor(widthPx / 110), 3, 9);

  const interval =
    X_TICK_INTERVALS_MS.find(
      (candidate) => spanMs / candidate <= targetTickCount,
    ) ?? X_TICK_INTERVALS_MS[X_TICK_INTERVALS_MS.length - 1];

  const alignedStart = Math.ceil(first / interval) * interval;

  const ticks: number[] = [];
  for (let ts = alignedStart; ts <= last; ts += interval) {
    ticks.push(ts);
  }

  if (ticks.length === 0) {
    ticks.push(first, last);
  }

  return ticks;
}

export function toChartPoints(
  data: TrafficPoint[],
  frame: ChartFrame,
  domainMax: number,
): ChartPoint[] {
  if (data.length === 0) return [];

  const { width, height, padding } = frame;
  const innerWidth = Math.max(1, width - padding.left - padding.right);
  const innerHeight = Math.max(1, height - padding.top - padding.bottom);

  const minTs = data[0].ts;
  const maxTs = data[data.length - 1].ts;
  const timeSpan = Math.max(1, maxTs - minTs);
  const yRange = Math.max(0.001, domainMax);

  return data.map((point) => {
    const x = padding.left + ((point.ts - minTs) / timeSpan) * innerWidth;
    const normalized = clamp(point.delta_gb / yRange, 0, 1);
    const y = padding.top + (1 - normalized) * innerHeight;
    return { ...point, x, y };
  });
}

export function buildLinePath(points: ChartPoint[]): string {
  if (points.length === 0) return "";

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x} ${points[i].y}`;
  }

  return path;
}

export function buildAreaPath(points: ChartPoint[], baselineY: number): string {
  if (points.length === 0) return "";

  let path = `M ${points[0].x} ${baselineY}`;
  path += ` L ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x} ${points[i].y}`;
  }

  path += ` L ${points[points.length - 1].x} ${baselineY} Z`;
  return path;
}

export function findClosestPointIndexByX(
  points: ChartPoint[],
  x: number,
): number {
  if (points.length <= 1) return 0;

  let lo = 0;
  let hi = points.length - 1;

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (points[mid].x < x) lo = mid + 1;
    else hi = mid;
  }

  const right = lo;
  const left = Math.max(0, right - 1);

  return Math.abs(points[right].x - x) < Math.abs(points[left].x - x)
    ? right
    : left;
}
