import { useState, useEffect } from "react";
import {
  msUntil,
  msToTimeComponents,
  formatTimeComponents,
} from "@/lib/formatters";
import type { ExpiryTier } from "@/lib/formatters";
import type { UserResponse } from "@/api/types";

// -------------------------------------------------------------
// Типы
// -------------------------------------------------------------

export type SubscriptionValue =
  | { text: string; sub: string }
  | { text: string; sub: string; color: string }
  | { text: string; unit: string; sub: string; color: string }
  | { text: string; sub: string; color: string; icon: true };

// -------------------------------------------------------------
// Хук
// -------------------------------------------------------------

/**
 * Возвращает оставшееся время до указанной ISO-даты,
 * обновляясь каждые 60 секунд.
 * Возвращает null если дата не задана или уже прошла.
 */
export function useLiveCountdown(iso: string | null | undefined) {
  const calc = () => {
    if (!iso) return null;
    const ms = msUntil(iso);
    if (!ms || ms <= 0) return null;
    return msToTimeComponents(ms);
  };

  const [time, setTime] = useState(calc);

  useEffect(() => {
    if (!iso) return;
    const tick = () => setTime(calc());
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [iso]);

  return time;
}

// -------------------------------------------------------------
// Утилиты
// -------------------------------------------------------------

/**
 * Вернуть лейбл и CSS-классы для бейджа статуса аккаунта.
 * Приоритет: заблокирован -> неактивен -> активен.
 */
export function getAccountStatus(profile: UserResponse) {
  if (!profile.allowed) {
    return {
      label: "Заблокирован",
      color: "text-red-500 bg-red-500/10 border-red-500/20",
    };
  }
  if (!profile.active) {
    return {
      label: "Неактивен",
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    };
  }
  return {
    label: "Активен",
    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  };
}

/**
 * Вернуть данные для отображения плитки "Подписка".
 *
 * Логика:
 *   - нет даты истечения   -> "Нет / необходима активация"
 *   - срок истёк           -> "Истекла / обратитесь к администратору"
 *   - последний день       -> живой обратный отсчёт по часам/минутам
 *   - критический уровень  -> amber-500
 *   - предупреждение       -> amber-400
 *   - норма                -> стандартный цвет
 */
export function getSubscriptionValue(
  expiresAt: string | null,
  daysLeft: number | null,
  timeLeft: ReturnType<typeof useLiveCountdown>,
  expiryTier: ExpiryTier,
): SubscriptionValue {
  if (!expiresAt) {
    return { text: "Нет", sub: "необходима активация" };
  }

  if (daysLeft !== null && daysLeft < 0) {
    return {
      text: "Истекла",
      sub: "часики тик-так тик-так ...",
      color: "text-red-500",
    };
  }

  if (daysLeft === 0 && timeLeft) {
    const color = timeLeft.hours < 1 ? "text-red-500" : "text-amber-500";
    return {
      text: formatTimeComponents(timeLeft),
      sub: "осталось",
      color,
      icon: true,
    };
  }

  const color =
    expiryTier === "critical"
      ? "text-amber-500"
      : expiryTier === "warning"
        ? "text-amber-400"
        : "text-foreground";

  return { text: String(daysLeft), unit: "дн.", sub: "осталось", color };
}

/**
 * Вернуть процент заполнения прогресс-бара истечения срока (0–100).
 * За 100% принимается 30 дней.
 */
export function getExpiryPct(daysLeft: number | null): number {
  if (daysLeft === null || daysLeft <= 0) return 0;
  return Math.min(100, (daysLeft / 30) * 100);
}
