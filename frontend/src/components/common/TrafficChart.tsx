import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { useTraffic } from "@/hooks/useTraffic";
import type { TrafficPoint } from "@/hooks/useTraffic";

// -------------------------------------------------------------
// Форматирование
// -------------------------------------------------------------

/** Для шапки — с пробелом и полной единицей */
function fmtGb(gb: number): string {
  if (gb === 0) return "0 B";
  if (gb < 0.001) return `${(gb * 1024 * 1024).toFixed(0)} KB`;
  if (gb < 1) return `${(gb * 1024).toFixed(gb * 1024 < 10 ? 2 : 1)} MB`;
  return `${gb.toFixed(3)} GB`;
}

/** Для тиков оси Y — без пробела, компактно */
function fmtYTick(gb: number): string {
  if (gb === 0) return "0";
  if (gb < 0.001) return `${(gb * 1024 * 1024).toFixed(0)}K`;
  if (gb < 1) return `${(gb * 1024).toFixed(0)}M`;
  return `${gb.toFixed(1)}G`;
}

/** Для тиков оси X */
function fmtTick(ts: number): string {
  return new Date(ts).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Moscow",
  });
}

/** Для tooltip */
function fmtTooltipLabel(ts: number, days: number): string {
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

// -------------------------------------------------------------
// Тики оси X
// -------------------------------------------------------------

const TICK_INTERVAL: Record<number, number> = {
  1: 3 * 60 * 60 * 1000,
  2: 6 * 60 * 60 * 1000,
  3: 8 * 60 * 60 * 1000,
};

function buildTicks(data: TrafficPoint[], days: number): number[] {
  if (data.length === 0) return [];
  const interval = TICK_INTERVAL[days] ?? TICK_INTERVAL[3];
  const first = data[0].ts;
  const last = data[data.length - 1].ts;
  const ticks: number[] = [];
  const aligned = Math.ceil(first / interval) * interval;
  for (let t = aligned; t <= last; t += interval) {
    ticks.push(t);
  }
  return ticks;
}

// -------------------------------------------------------------
// Сглаживание данных (скользящее среднее по окну)
// -------------------------------------------------------------

function smoothData(data: TrafficPoint[], radius = 3): TrafficPoint[] {
  if (data.length === 0) return data;
  return data.map((point, i) => {
    const start = Math.max(0, i - radius);
    const end = Math.min(data.length - 1, i + radius);
    let sum = 0;
    let count = 0;
    for (let j = start; j <= end; j++) {
      // Вес убывает от центра — треугольное окно
      const w = radius + 1 - Math.abs(j - i);
      sum += data[j].delta_gb * w;
      count += w;
    }
    return { ...point, delta_gb: sum / count };
  });
}

// -------------------------------------------------------------
// Кастомный Tooltip
// -------------------------------------------------------------

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: number;
  days: number;
}

function ChartTooltip({ active, payload, label, days }: TooltipProps) {
  if (!active || !payload?.length || label === undefined) return null;
  const val = payload[0].value;
  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2 shadow-lg text-xs">
      <p className="text-muted-foreground mb-1">
        {fmtTooltipLabel(label, days)}
      </p>
      <p className="font-semibold text-foreground tabular-nums">{fmtGb(val)}</p>
    </div>
  );
}

// -------------------------------------------------------------
// Табы
// -------------------------------------------------------------

const DAY_OPTIONS = [
  { value: 1 as const, label: "1 день" },
  { value: 2 as const, label: "2 дня" },
  { value: 3 as const, label: "3 дня" },
];

// -------------------------------------------------------------
// Компонент
// -------------------------------------------------------------

interface TrafficChartProps {
  username?: string;
}

/**
 * Компонент для отображения графика трафика.
 *  - Если `username` не передан, показывает трафик текущего пользователя.
 *  - Включает табы для выбора периода (1, 2 или 3 дня).
 *  - Показывает общую сумму трафика в шапке.
 *  - Использует Recharts для отрисовки графика с кастомным tooltip.
 *  - Подбирает интервалы и форматирование тиков в зависимости от выбранного периода и данных.
 */
export function TrafficChart({ username }: TrafficChartProps = {}) {
  const [days, setDays] = useState<1 | 2 | 3>(1);

  // username пробрасывается в хук — без него возвращает трафик текущего пользователя
  const {
    data: rawData,
    totalGb,
    isLoading,
    isError,
  } = useTraffic(days, username);

  // Сглаживаем данные для плавной кривой
  const data = useMemo(() => smoothData(rawData, 4), [rawData]);

  const ticks = useMemo(() => buildTicks(data, days), [data, days]);

  const yMax = useMemo(() => {
    const peak = Math.max(...data.map((p) => p.delta_gb), 0);
    return peak > 0 ? peak * 1.3 : 0.001;
  }, [data]);

  const yWidth = useMemo(() => {
    if (yMax < 1) return yMax * 1024 >= 100 ? 48 : 40;
    return 44;
  }, [yMax]);

  return (
    <Card className="p-5 flex flex-col gap-4">
      {/* Шапка */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            График
          </p>
          <p className="text-2xl font-bold text-foreground tabular-nums mt-1">
            {isLoading ? (
              <span className="text-muted-foreground">—</span>
            ) : (
              fmtGb(totalGb)
            )}
          </p>
        </div>

        {/* Табы */}
        <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
          {DAY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDays(opt.value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                days === opt.value
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* График */}
      <div className="h-44 w-full">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner className="size-5" />
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-muted-foreground">
              Не удалось загрузить данные
            </p>
          </div>
        ) : (
          // Добавлены minHeight и initialDimension в ResponsiveContainer.
          // Проблема библиотеки при использовании height="100%"
          // на первом рендере, когда реальные размеры контейнера ещё не посчитаны.
          <ResponsiveContainer
            width="100%"
            height="100%"
            minHeight={160}
            initialDimension={{ width: 300, height: 176 }}
          >
            <AreaChart
              data={data}
              margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="trafficGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="var(--color-primary)"
                    stopOpacity={0.55}
                  />
                  <stop
                    offset="60%"
                    stopColor="var(--color-primary)"
                    stopOpacity={0.12}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-primary)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                vertical={false}
                stroke="var(--color-border)"
                strokeOpacity={0.5}
              />

              <XAxis
                dataKey="ts"
                type="number"
                scale="time"
                domain={["dataMin", "dataMax"]}
                ticks={ticks}
                tickFormatter={fmtTick}
                tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                minTickGap={40}
              />

              <YAxis
                tickFormatter={fmtYTick}
                tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                width={yWidth}
                domain={[0, yMax]}
                tickCount={5}
              />

              <Tooltip
                content={<ChartTooltip days={days} />}
                cursor={{
                  stroke: "var(--color-primary)",
                  strokeWidth: 1,
                  strokeOpacity: 0.4,
                  strokeDasharray: "4 4",
                }}
              />

              <Area
                type="basis"
                dataKey="delta_gb"
                stroke="var(--color-primary)"
                strokeWidth={2}
                fill="url(#trafficGradient)"
                isAnimationActive={true}
                animationDuration={600}
                animationEasing="ease-out"
                dot={false}
                activeDot={{
                  r: 4,
                  fill: "var(--color-primary)",
                  stroke: "var(--color-card)",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
