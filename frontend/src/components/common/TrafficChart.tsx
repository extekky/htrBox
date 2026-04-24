import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  type PointerEvent as ReactPointerEvent,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/cn";
import { styles } from "@/styles";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { useTraffic, type TrafficDays } from "@/hooks/useTraffic";
import {
  buildAreaPath,
  buildLinePath,
  buildXTicks,
  buildYScale,
  downsampleTraffic,
  findClosestPointIndexByX,
  getPointBudget,
  smoothTraffic,
  toChartPoints,
  type ChartFrame,
} from "@/lib/trafficModel";

const s = styles.trafficChart;

const DEFAULT_CHART_WIDTH = 320;
const DEFAULT_CHART_HEIGHT = 236;
const PADDING = {
  top: 14,
  right: 14,
  bottom: 26,
  left: 42,
} as const;

const RANGE_OPTIONS = [
  { value: 1 as const, label: "24ч" },
  { value: 3 as const, label: "3д" },
  { value: 7 as const, label: "7д" },
];

interface TrafficChartProps {
  username?: string;
}

function sanitizeUid(uid: string): string {
  return uid.replace(/:/g, "");
}

function formatTraffic(gb: number): string {
  if (gb === 0) return "0 B";
  if (gb < 0.001) return `${(gb * 1024 * 1024).toFixed(0)} KB`;
  if (gb < 1) return `${(gb * 1024).toFixed(gb * 1024 < 10 ? 2 : 1)} MB`;
  return `${gb.toFixed(3)} GB`;
}

function formatYTick(gb: number): string {
  if (gb === 0) return "0";
  if (gb < 0.001) return `${(gb * 1024 * 1024).toFixed(0)}K`;
  if (gb < 1) return `${(gb * 1024).toFixed(0)}M`;
  return `${gb.toFixed(1)}G`;
}

function formatXTick(ts: number, days: TrafficDays): string {
  return new Date(ts).toLocaleString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    day: days >= 7 ? "numeric" : undefined,
    month: days >= 7 ? "short" : undefined,
    timeZone: "Europe/Moscow",
  });
}

function formatTooltipLabel(ts: number, days: TrafficDays): string {
  const date = new Date(ts);
  if (days === 1) {
    return date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Moscow",
    });
  }

  return date.toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Moscow",
  });
}

function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({
    width: DEFAULT_CHART_WIDTH,
    height: DEFAULT_CHART_HEIGHT,
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let rafId = 0;

    const update = (nextWidth: number, nextHeight: number) => {
      const width = Math.max(1, Math.round(nextWidth));
      const height = Math.max(1, Math.round(nextHeight));

      setSize((prev) =>
        prev.width === width && prev.height === height
          ? prev
          : { width, height },
      );
    };

    const rect = el.getBoundingClientRect();
    update(rect.width, rect.height);

    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        update(entry.contentRect.width, entry.contentRect.height);
      });
    });

    observer.observe(el);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

  return { ref, size };
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setPrefersReducedMotion(media.matches);

    sync();

    if (media.addEventListener) {
      media.addEventListener("change", sync);
      return () => media.removeEventListener("change", sync);
    }

    media.addListener(sync);
    return () => media.removeListener(sync);
  }, []);

  return prefersReducedMotion;
}

function getDevicePixelRatio(): number {
  if (typeof window === "undefined") return 1;
  return Math.max(1, Math.min(2, window.devicePixelRatio || 1));
}

export function TrafficChart({ username }: TrafficChartProps = {}) {
  const [days, setDays] = useState<TrafficDays>(3);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const chartUid = sanitizeUid(useId());
  const gradientId = `traffic-chart-gradient-${chartUid}`;
  const panelId = `traffic-chart-panel-${chartUid}`;

  const { ref: chartRef, size } = useElementSize<HTMLDivElement>();
  const prefersReducedMotion = usePrefersReducedMotion();

  const {
    data: rawData,
    totalGb,
    isLoading,
    isError,
  } = useTraffic(days, username);

  const pointBudget = useMemo(
    () => getPointBudget(size.width, getDevicePixelRatio()),
    [size.width],
  );

  const sampledData = useMemo(
    () => downsampleTraffic(rawData, pointBudget),
    [rawData, pointBudget],
  );

  const chartData = useMemo(() => smoothTraffic(sampledData, 2), [sampledData]);

  const peakValue = useMemo(
    () => Math.max(...chartData.map((p) => p.delta_gb), 0),
    [chartData],
  );

  const yScale = useMemo(() => buildYScale(peakValue, 5), [peakValue]);

  const frame = useMemo<ChartFrame>(
    () => ({ width: size.width, height: size.height, padding: PADDING }),
    [size.width, size.height],
  );

  const points = useMemo(
    () => toChartPoints(chartData, frame, yScale.domainMax),
    [chartData, frame, yScale.domainMax],
  );

  const areaPath = useMemo(() => {
    const baselineY = frame.height - frame.padding.bottom;
    return buildAreaPath(points, baselineY);
  }, [points, frame.height, frame.padding.bottom]);

  const linePath = useMemo(() => buildLinePath(points), [points]);

  const xTicks = useMemo(
    () => buildXTicks(rawData, size.width),
    [rawData, size.width],
  );

  const xTickPositions = useMemo(() => {
    if (rawData.length < 2) return [] as Array<{ ts: number; x: number }>;

    const minTs = rawData[0].ts;
    const maxTs = rawData[rawData.length - 1].ts;
    const span = Math.max(1, maxTs - minTs);
    const innerWidth = Math.max(
      1,
      frame.width - frame.padding.left - frame.padding.right,
    );

    return xTicks.map((ts) => ({
      ts,
      x: frame.padding.left + ((ts - minTs) / span) * innerWidth,
    }));
  }, [rawData, xTicks, frame]);

  const hoverPoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  const tooltipStyle = useMemo(() => {
    if (!hoverPoint) return undefined;

    const margin = 8;
    const tooltipWidth = 150;
    const tooltipHeight = 64;

    const left = Math.max(
      margin,
      Math.min(
        hoverPoint.x - tooltipWidth / 2,
        frame.width - tooltipWidth - margin,
      ),
    );

    const top =
      hoverPoint.y > frame.height / 2
        ? Math.max(margin, hoverPoint.y - tooltipHeight - 12)
        : Math.min(frame.height - tooltipHeight - margin, hoverPoint.y + 12);

    return { left, top };
  }, [hoverPoint, frame.width, frame.height]);

  const moveRafRef = useRef(0);

  const clearHover = useCallback(() => {
    setHoveredIndex(null);
  }, []);

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (points.length === 0) return;

      const rect = event.currentTarget.getBoundingClientRect();
      const nextX = event.clientX - rect.left;

      if (moveRafRef.current) cancelAnimationFrame(moveRafRef.current);
      moveRafRef.current = requestAnimationFrame(() => {
        const index = findClosestPointIndexByX(points, nextX);
        setHoveredIndex(index);
      });
    },
    [points],
  );

  useEffect(() => {
    return () => {
      if (moveRafRef.current) cancelAnimationFrame(moveRafRef.current);
    };
  }, []);

  useEffect(() => {
    setHoveredIndex(null);
  }, [days, username, pointBudget]);

  const hasData = chartData.length > 0;

  return (
    <Card className={s.root}>
      <div className={s.header}>
        <div className={s.headerBody}>
          <p className={s.title}>Трафик</p>
          <p className={s.total}>
            {isLoading ? (
              <span className={s.totalPlaceholder}>—</span>
            ) : (
              formatTraffic(totalGb)
            )}
          </p>
          <p className={s.subtitle}>
            {isLoading
              ? "Обновляем данные"
              : `${chartData.length} точек`}
          </p>
        </div>

        <div
          className={s.tabs}
          role="tablist"
          aria-label="Период графика трафика"
        >
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              id={`traffic-tab-${chartUid}-${option.value}`}
              role="tab"
              aria-selected={days === option.value}
              aria-controls={panelId}
              tabIndex={days === option.value ? 0 : -1}
              className={cn(
                s.tabButton,
                days === option.value ? s.tabButtonActive : s.tabButtonDefault,
              )}
              onClick={() => setDays(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={chartRef}
        className={s.chartSurface}
        role="tabpanel"
        id={panelId}
        aria-labelledby={`traffic-tab-${chartUid}-${days}`}
      >
        {isLoading ? (
          <div className={s.stateWrap}>
            <Spinner className={s.spinner} />
          </div>
        ) : isError ? (
          <div className={s.stateWrap}>
            <p className={s.stateText}>Не удалось загрузить трафик</p>
          </div>
        ) : !hasData ? (
          <div className={s.stateWrap}>
            <p className={s.stateText}>За выбранный период нет данных</p>
          </div>
        ) : (
          <>
            <svg
              viewBox={`0 0 ${frame.width} ${frame.height}`}
              className={s.chartSvg}
              aria-label="График трафика"
              role="img"
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--color-primary)"
                    stopOpacity={0.32}
                  />
                  <stop
                    offset="70%"
                    stopColor="var(--color-primary)"
                    stopOpacity={0.08}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-primary)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              {yScale.ticks.map((tick) => {
                const baselineY = frame.height - frame.padding.bottom;
                const innerHeight = Math.max(
                  1,
                  frame.height - frame.padding.top - frame.padding.bottom,
                );
                const y = baselineY - (tick / yScale.domainMax) * innerHeight;

                return (
                  <g key={tick}>
                    <line
                      x1={frame.padding.left}
                      y1={y}
                      x2={frame.width - frame.padding.right}
                      y2={y}
                      stroke="var(--color-border)"
                      strokeOpacity={0.45}
                      strokeDasharray="3 3"
                    />
                    <text
                      x={frame.padding.left - 8}
                      y={y + 3}
                      textAnchor="end"
                      className={s.axisLabel}
                    >
                      {formatYTick(tick)}
                    </text>
                  </g>
                );
              })}

              {xTickPositions.map((tick) => (
                <text
                  key={tick.ts}
                  x={tick.x}
                  y={frame.height - 8}
                  textAnchor="middle"
                  className={s.axisLabel}
                >
                  {formatXTick(tick.ts, days)}
                </text>
              ))}

              <path d={areaPath} fill={`url(#${gradientId})`} />

              <path
                d={linePath}
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                style={
                  prefersReducedMotion
                    ? undefined
                    : { transition: "d 220ms ease-out" }
                }
              />

              {hoverPoint && (
                <>
                  <line
                    x1={hoverPoint.x}
                    y1={frame.padding.top}
                    x2={hoverPoint.x}
                    y2={frame.height - frame.padding.bottom}
                    stroke="var(--color-primary)"
                    strokeOpacity={0.35}
                    strokeDasharray="4 4"
                  />
                  <circle
                    cx={hoverPoint.x}
                    cy={hoverPoint.y}
                    r={4}
                    fill="var(--color-primary)"
                    stroke="var(--color-card)"
                    strokeWidth={2}
                  />
                </>
              )}
            </svg>

            <div
              className={s.chartOverlay}
              onPointerMove={handlePointerMove}
              onPointerEnter={handlePointerMove}
              onPointerLeave={clearHover}
              onPointerCancel={clearHover}
            />

            {hoverPoint && tooltipStyle && (
              <div className={s.tooltipRoot} style={tooltipStyle}>
                <p className={s.tooltipLabel}>
                  {formatTooltipLabel(hoverPoint.ts, days)}
                </p>
                <p className={s.tooltipValue}>
                  {formatTraffic(hoverPoint.delta_gb)}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
