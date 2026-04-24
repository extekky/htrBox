import { cn } from "@/lib/cn";
import { styles } from "@/styles";

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

const s = styles.progressBar;

/** Возвращает класс цвета заполнения в зависимости от процента потреблённого трафика. */
function getTrafficFill(pct: number): string {
  if (pct >= 90) return s.fillDanger;
  if (pct >= 70) return s.fillWarning;
  return s.fillPrimary;
}

/** Возвращает класс цвета заполнения в зависимости от оставшегося срока действия. */
function getExpiryFill(pct: number): string {
  if (pct <= 0) return s.fillMuted;
  if (pct <= 10) return s.fillDanger;
  if (pct <= 30) return s.fillWarning;
  return s.fillPrimary;
}

export function ProgressBar({ value, variant, className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const fill =
    variant === "traffic" ? getTrafficFill(clamped) : getExpiryFill(clamped);

  return (
    <div className={cn(s.root, className)}>
      <div className={cn(s.track, fill)} style={{ width: `${clamped}%` }} />
    </div>
  );
}
