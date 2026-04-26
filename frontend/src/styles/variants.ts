/**
 * variants.ts
 *
 * Семантические цветовые схемы — связки bg + border + text для смысловых состояний.
 * Используются в компонентах с вариантами: баннеры, бейджи, тосты, алерты.
 *
 * ПРАВИЛО: если компоненту нужен цвет с семантическим смыслом (предупреждение,
 * ошибка, успех) — бери отсюда. Не придумывай amber/red/green заново.
 *
 * Ключи называются по смыслу, не по цвету:
 *   warning (не amber), danger (не red), success (не green), info (не blue)
 */

// -------------------------------------------------------------
// Основные схемы — bg + border + text + вспомогательные
// -------------------------------------------------------------

export const colorScheme = {
  warning: {
    bg: "bg-amber-500/12",
    border: "border-amber-500/24",
    text: "text-amber-700",
    textMuted: "text-amber-700/72",
    solid: "bg-amber-500",
    hover: "hover:bg-amber-500/20",
  },
  danger: {
    bg: "bg-destructive/12",
    border: "border-destructive/24",
    text: "text-destructive",
    textMuted: "text-destructive/72",
    solid: "bg-destructive",
    hover: "hover:bg-destructive/18",
  },
  success: {
    bg: "bg-emerald-500/12",
    border: "border-emerald-500/24",
    text: "text-emerald-700",
    textMuted: "text-emerald-700/72",
    solid: "bg-emerald-500",
    hover: "hover:bg-emerald-500/18",
  },
  info: {
    bg: "bg-blue-500/12",
    border: "border-blue-500/24",
    text: "text-blue-700",
    textMuted: "text-blue-700/72",
    solid: "bg-blue-500",
    hover: "hover:bg-blue-500/18",
  },
  primary: {
    bg: "bg-primary/12",
    border: "border-primary/24",
    text: "text-primary",
    textMuted: "text-primary/74",
    solid: "bg-primary",
    hover: "hover:bg-primary/18",
  },
  neutral: {
    bg: "bg-muted",
    border: "border-border",
    text: "text-foreground",
    textMuted: "text-muted-foreground",
    solid: "bg-muted-foreground",
    hover: "hover:bg-muted",
  },
  purple: {
    bg: "bg-purple-500/12",
    border: "border-purple-500/24",
    text: "text-purple-700/70",
    textMuted: "text-purple-700/72",
    solid: "bg-purple-500",
    hover: "hover:bg-purple-500/18",
  },
  cyan: {
    bg: "bg-cyan-500/12",
    border: "border-cyan-500/24",
    text: "text-cyan-700",
    textMuted: "text-cyan-700/72",
    solid: "bg-cyan-500",
    hover: "hover:bg-cyan-500/18",
  },
  rose: {
    bg: "bg-rose-500/12",
    border: "border-rose-500/24",
    text: "text-rose-700",
    textMuted: "text-rose-700/72",
    solid: "bg-rose-500",
    hover: "hover:bg-rose-500/18",
  },
} as const;

export type ColorScheme = keyof typeof colorScheme;
