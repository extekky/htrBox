import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";

/**
 * Хук для управления состоянием закрытия баннера.
 *
 * - Баннер показывается один раз за сессию логина.
 * - После закрытия крестиком — не показывается до следующего login.
 * - Refresh не считается новым login (loginTimestamp не персистируется).
 *
 * @param bannerId   — уникальный идентификатор баннера
 * @param isEligible — внешнее условие показа (например, !profile.active)
 */
export function useNotifyBanner(bannerId: string, isEligible: boolean) {
  const loginTimestamp = useAuthStore((s) => s.loginTimestamp);

  const storageKey = loginTimestamp
    ? `banner_${bannerId}_${loginTimestamp}`
    : null;

  const [dismissed, setDismissed] = useState(() => {
    if (!storageKey) return true;
    try {
      return sessionStorage.getItem(storageKey) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!storageKey) {
      setDismissed(true);
      return;
    }
    setDismissed(sessionStorage.getItem(storageKey) === "1");
  }, [storageKey]);

  const dismiss = () => {
    if (!storageKey) return;
    try {
      sessionStorage.setItem(storageKey, "1");
    } catch {
      // ignore
    }
    setDismissed(true);
  };

  return {
    visible: isEligible && !dismissed,
    dismiss,
  };
}
