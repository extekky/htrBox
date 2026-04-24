/**
 * layoutStls.ts
 *
 * Готовые стили для компонентов проекта.
 *
 * Использование:
 *   import { styles } from "@/styles"
 *   className={styles.bottomBar.root}
 *
 * Структура каждого компонента:
 *   root      — корневой элемент
 *   [slot]    — именованные слоты внутри
 *
 * ПРАВИЛО: если ты пишешь className="" в JSX — это ошибка.
 */

import { colorScheme } from "@/styles/variants";
import { transition, hover } from "@/styles/animations";
import { surface, radius, spacing, focus } from "@/styles/tokens";

// -------------------------------------------------------------
// BottomBar — мобильная нижняя панель навигации
// -------------------------------------------------------------

export const bottomBar = {
  // Корневой контейнер — фиксированная панель с frosted-фоном
  // bg-background/90 — намеренно плотнее surface.frosted (/80) для читаемости навигации
  root: [
    "fixed bottom-0 left-0 right-0 z-30",
    "flex items-stretch",
    "bg-background/92 backdrop-blur-md",
    "border-t border-border/60",
    "shadow-[0_-10px_24px_-18px_rgba(15,23,42,0.35)]",
    "pb-safe glass",
  ].join(" "),

  // Внутренняя строка — фиксированная высота, равномерное распределение пунктов
  inner: "flex w-full items-stretch h-16",

  // Пункт навигации — базовая геометрия (цвет задаётся вариантными слотами)
  item: `flex-1 flex flex-col items-center justify-center gap-1 relative ${transition.colors}`,

  // Пункт активен
  itemActive: colorScheme.primary.text,

  // Пункт неактивен
  itemDefault: "text-muted-foreground",

  // Подсветка активного пункта — pill за иконкой
  activePill: `absolute inset-x-2 top-1.5 bottom-1.5 rounded-xl border border-primary/20 ${colorScheme.primary.bg}`,

  // Иконка пункта
  icon: `relative z-10 ${transition.transform}`,

  // Иконка активного пункта — лёгкое увеличение
  iconActive: "scale-110",

  // Подпись пункта
  label: "relative z-10 text-[9px] font-medium tracking-[0.02em] leading-none",
} as const;

// -------------------------------------------------------------
// AppShell — корневая обёртка приложения с шапкой и навигацией
// -------------------------------------------------------------

export const appShell = {
  // Корневой контейнер — вся страница
  root: `flex flex-col min-h-screen ${surface.page}`,

  // Залипающая шапка — frosted-фон + нижняя граница
  // z-40 намеренно выше bottomBar (z-30), sticky вместо fixed
  header:
    "sticky top-0 z-40 border-b border-border/60 bg-background/88 backdrop-blur-md glass",

  // Внутренняя строка шапки
  headerInner: "relative flex items-center justify-between h-14 px-4 sm:px-6",

  // Левая группа — логотип + десктопная навигация
  headerLeft: "flex items-center",

  // Правая группа — действия и меню
  headerRight: `flex items-center gap-2 sm:gap-3`,

  // Логотип — обёртка ссылки
  logoWrap: "flex items-center gap-2.5 cursor-pointer group shrink-0",

  // Логотип — текст бренда
  logoText: `font-bold text-base tracking-tight text-foreground group-hover:text-primary ${transition.colors}`,

  // Десктопная навигация — абсолютно по центру шапки
  desktopNav: `hidden md:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2`,

  // Пункт навигации — базовая геометрия
  navItem: `relative flex items-center ${spacing.inlineGapSm} h-8 px-3 ${radius.sm} text-sm font-medium ${transition.colors}`,

  // Пункт активен
  navItemActive: "text-primary bg-primary/12",

  // Пункт неактивен
  navItemDefault: `text-muted-foreground ${hover.nav}`,

  // Точка-индикатор активного пункта
  navDot: `absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 ${radius.full} bg-primary`,

  // Ссылка на Telegram
  telegramLink: [
    `inline-flex items-center ${spacing.inlineGapSm} h-8 px-2.5 sm:px-3 rounded-lg text-xs font-medium`,
    colorScheme.primary.bg,
    colorScheme.primary.text,
    colorScheme.primary.border,
    "border",
    `${colorScheme.primary.hover} ${transition.colors}`,
  ].join(" "),

  // Ник в ссылке Telegram — скрыт на мобильных
  telegramNick: "hidden sm:inline",

  // Кнопка-аватар — триггер дропдауна
  // focus.ring покрывает outline + ring, ring-offset-2 — дополнение
  avatarBtn: `${radius.full} focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`,

  // Аватар — круглая обёртка
  avatarWrap: `w-8 h-8 ${radius.full} overflow-hidden shrink-0 ring-2 ring-border/70 bg-muted flex items-center justify-center`,

  // Аватар — инициал пользователя
  avatarInitial:
    "w-full h-full flex items-center justify-center text-xs font-bold text-muted-foreground",

  // Ширина дропдауна пользователя
  dropdownWidth: "w-48",

  // Пункт выхода — деструктивный
  logoutItem: [
    "cursor-pointer text-destructive",
    "focus:text-destructive focus:bg-destructive/12",
    "data-[highlighted]:text-destructive data-[highlighted]:bg-destructive/12",
  ].join(" "),

  // Основная область контента
  main: "flex-1 flex flex-col min-h-0 overflow-x-hidden",

  // Отступ снизу когда виден BottomBar
  mainMobilePad: "pb-20",
} as const;
