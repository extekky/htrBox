import { cn } from "@/lib/cn";

// -------------------------------------------------------------
// Типы
// -------------------------------------------------------------

export type ProgressVariant = "traffic" | "expiry";

export interface ProgressBarProps {
  /** Процент заполнения (0–100). Значения обрезаются до этого диапазона. */
  value: number;
  /** Вариант цветовой логики — см. helpers ниже. */
  variant: ProgressVariant;
  /** Дополнительные классы для корневого элемента. */
  className?: string;
}

// -------------------------------------------------------------
// Цветовые хелперы
// -------------------------------------------------------------

/** Возвращает класс цвета заполнения в зависимости от процента потреблённого трафика. */
function getTrafficFill(pct: number): string {
  if (pct >= 90) return "bg-red-500";
  if (pct >= 70) return "bg-amber-500";
  return "bg-primary";
}

/** Возвращает класс цвета заполнения в зависимости от оставшегося срока действия. */
function getExpiryFill(pct: number): string {
  if (pct <= 0) return "bg-muted";
  if (pct <= 10) return "bg-red-500";
  if (pct <= 30) return "bg-amber-500";
  return "bg-primary";
}

export function ProgressBar({ value, variant, className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const fill =
    variant === "traffic" ? getTrafficFill(clamped) : getExpiryFill(clamped);

  return (
    <div
      className={cn(
        "h-1 w-full rounded-full bg-muted overflow-hidden",
        className,
      )}
    >
      <div
        className={cn("h-full rounded-full transition-all duration-500", fill)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
