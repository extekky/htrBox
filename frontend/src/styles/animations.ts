/**
 * animations.ts
 */

// -------------------------------------------------------------
// Базовые transition-утилиты
// -------------------------------------------------------------

export const transition = {
  // Универсальный — цвета, тени, opacity
  base: "transition-all duration-180 ease-[cubic-bezier(.2,.8,.2,1)]",
  colors: "transition-colors duration-160 ease-[cubic-bezier(.2,.8,.2,1)]",
  opacity: "transition-opacity duration-160 ease-[cubic-bezier(.2,.8,.2,1)]",
  shadow: "transition-shadow duration-200 ease-[cubic-bezier(.2,.8,.2,1)]",

  // Трансформации — scale, translate (иконки, hover-эффекты)
  transform:
    "transition-transform duration-180 ease-[cubic-bezier(.2,.8,.2,1)]",

  // Медленнее — для модалок, оверлеев
  slow: "transition-all duration-280 ease-[cubic-bezier(.2,.8,.2,1)]",
} as const;

// -------------------------------------------------------------
// Hover-эффекты
// -------------------------------------------------------------

export const hover = {
  // Стандартный hover для строк, карточек, пунктов меню
  subtle: "hover:bg-accent/70",
  // Hover для кнопок-призраков
  ghost: "hover:bg-secondary/80",
  // Hover для деструктивных элементов
  danger: "hover:bg-destructive/14",
  // Hover для nav-ссылок
  nav: "hover:bg-muted/60 hover:text-foreground",
} as const;

// -------------------------------------------------------------
// Active / press эффект
// -------------------------------------------------------------

export const press = {
  // Для кнопок с визуальным откликом на нажатие
  subtle: "active:scale-[0.985] active:opacity-85",
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
