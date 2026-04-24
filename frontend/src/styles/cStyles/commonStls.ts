/**
 * commonStls.ts
 *
 * Готовые стили для компонентов проекта.
 *
 * Использование:
 *   import { styles } from "@/styles"
 *   className={styles.progressBar.root}
 *
 * Структура каждого компонента:
 *   root      — корневой элемент
 *   [slot]    — именованные слоты внутри
 *
 * ПРАВИЛО: если ты пишешь className="" в JSX — это ошибка.
 */

import { radius } from "@/styles/tokens";
import { colorScheme } from "@/styles/variants";

// -------------------------------------------------------------
// ProgressBar — горизонтальный индикатор прогресса
// -------------------------------------------------------------

export const progressBar = {
  // Корневой трек — тонкая полоса с bg-muted и обрезкой
  root: `h-1 w-full ${radius.full} bg-muted overflow-hidden`,

  // Заполнение трека — высота + форма + замедленная анимация ширины
  track: `h-full ${radius.full} transition-all duration-500`,

  // Цветовые варианты заполнения — берём solid из colorScheme
  fillDanger: colorScheme.danger.solid, // bg-destructive
  fillWarning: colorScheme.warning.solid, // bg-amber-500
  fillPrimary: colorScheme.primary.solid, // bg-primary
  fillMuted: "bg-muted", // нет совпадения в colorScheme.solid
} as const;

// -------------------------------------------------------------
// StatusBadge / Pill — pill-shaped бейджи статусов
// -------------------------------------------------------------

export const statusBadge = {
  // Базовая геометрия pill — общая для всех вариантов
  pill: `inline-flex items-center ${radius.full} px-2.5 py-0.5 text-xs font-medium whitespace-nowrap border`,

  // Нейтральный вариант — неактивен, пользователь, нет/ок срока
  neutral: "bg-muted text-muted-foreground border-muted",

  // Разрешён — зелёный с повышенным контрастом текста (dark-aware)
  allowed: `${colorScheme.success.bg} ${colorScheme.success.border} text-green-700 dark:text-green-300`,

  // Заблокирован / критично / истёк — danger
  danger: `${colorScheme.danger.bg} ${colorScheme.danger.text} ${colorScheme.danger.border}`,

  // Активен — primary
  primary: `${colorScheme.primary.bg} ${colorScheme.primary.text} ${colorScheme.primary.border}`,

  // Роль Админ — amber с приглушённым текстом (/90)
  admin: `${colorScheme.warning.bg} ${colorScheme.warning.border} text-amber-500/90`,

  // Предупреждение (expiry warning) — amber с повышенным контрастом (dark-aware)
  warning: `${colorScheme.warning.bg} ${colorScheme.warning.border} text-amber-700 dark:text-amber-300`,
} as const;
