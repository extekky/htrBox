/**
 * animations.ts
 */

// -------------------------------------------------------------
// Базовые transition-утилиты
// -------------------------------------------------------------

export const transition = {
  // Универсальный — цвета, тени, opacity
  base: "transition-all duration-150 ease-in-out",
  colors: "transition-colors duration-150 ease-in-out",
  opacity: "transition-opacity duration-150 ease-in-out",
  shadow: "transition-shadow duration-200 ease-in-out",

  // Трансформации — scale, translate (иконки, hover-эффекты)
  transform: "transition-transform duration-150 ease-in-out",

  // Медленнее — для модалок, оверлеев
  slow: "transition-all duration-300 ease-in-out",
} as const;

// -------------------------------------------------------------
// Hover-эффекты
// -------------------------------------------------------------

export const hover = {
  // Стандартный hover для строк, карточек, пунктов меню
  subtle: "hover:bg-accent/60",
  // Hover для кнопок-призраков
  ghost: "hover:bg-secondary/70",
  // Hover для деструктивных элементов
  danger: "hover:bg-destructive/10",
  // Hover для nav-ссылок
  nav: "hover:bg-muted/60 hover:text-foreground",
} as const;

// -------------------------------------------------------------
// Active / press эффект
// -------------------------------------------------------------

export const press = {
  // Для кнопок с визуальным откликом на нажатие
  subtle: "active:scale-[0.98] active:opacity-80",
  // Для кнопок в таблицах и списках
  row: "active:bg-accent/80",
} as const;

// -------------------------------------------------------------
// Появление элементов (Radix / Portal-based)
// tw-animate-css классы для animate-in / animate-out
// -------------------------------------------------------------

export const enter = {
  // Попоуэры и дропдауны: fade + лёгкий zoom, быстро
  popover: [
    "data-[state=open]:animate-in   data-[state=open]:fade-in-0   data-[state=open]:zoom-in-95",
    "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
    "duration-150",
  ].join(" "),

  // Модальный оверлей — только fade, чуть медленнее
  overlay: [
    "data-[state=open]:animate-in   data-[state=open]:fade-in-0",
    "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
    "duration-200",
  ].join(" "),

  // Модальный контент — fade + zoom, чуть медленнее
  modal: [
    "data-[state=open]:animate-in   data-[state=open]:fade-in-0   data-[state=open]:zoom-in-95",
    "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
    "duration-150",
  ].join(" "),
} as const;

// -------------------------------------------------------------
// Спиннеры / индикаторы загрузки
// -------------------------------------------------------------

export const loading = {
  spin: "animate-spin",
  // Пульсирующий placeholder (skeleton)
  pulse: "animate-pulse",
} as const;
