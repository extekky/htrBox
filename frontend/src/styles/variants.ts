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
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    text: "text-amber-500",
    textMuted: "text-amber-500/70",
    solid: "bg-amber-500",
    hover: "hover:bg-amber-500/15",
  },
  danger: {
    bg: "bg-destructive/10",
    border: "border-destructive/20",
    text: "text-destructive",
    textMuted: "text-destructive/70",
    solid: "bg-destructive",
    hover: "hover:bg-destructive/15",
  },
  success: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    text: "text-emerald-500",
    textMuted: "text-emerald-500/70",
    solid: "bg-emerald-500",
    hover: "hover:bg-emerald-500/15",
  },
  info: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    text: "text-blue-500",
    textMuted: "text-blue-500/70",
    solid: "bg-blue-500",
    hover: "hover:bg-blue-500/15",
  },
  primary: {
    bg: "bg-primary/10",
    border: "border-primary/20",
    text: "text-primary",
    textMuted: "text-primary/70",
    solid: "bg-primary",
    hover: "hover:bg-primary/15",
  },
  neutral: {
    bg: "bg-muted",
    border: "border-border",
    text: "text-foreground",
    textMuted: "text-muted-foreground",
    solid: "bg-muted-foreground",
    hover: "hover:bg-muted",
  },
} as const;

export type ColorScheme = keyof typeof colorScheme;
