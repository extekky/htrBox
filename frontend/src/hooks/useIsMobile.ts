import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * Возвращает true, если текущая ширина viewport считается мобильной (< 768px).
 * Всегда возвращает boolean (никогда undefined), включая первый рендер.
 */
export function useIsMobile(): boolean {
  // Синхронное начальное значение — безопасно, так как хук работает только в браузере
  const getInitialState = (): boolean =>
    typeof window !== "undefined"
      ? window.innerWidth < MOBILE_BREAKPOINT
      : false;

  const [isMobile, setIsMobile] = useState<boolean>(getInitialState);

  useEffect(() => {
    // Защита от SSR (маловероятно, но на всякий случай)
    if (typeof window === "undefined") return;

    const mediaQuery = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;
    const mql = window.matchMedia(mediaQuery);

    const handleChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Современный способ подписки — работает во всех актуальных браузерах
    mql.addEventListener("change", handleChange);

    // Немедленная проверка на случай, если начальное состояние устарело после гидратации
    handleChange();

    return () => {
      mql.removeEventListener("change", handleChange);
    };
  }, []); // Пустой массив зависимостей — эффект запускается один раз

  return isMobile;
}
