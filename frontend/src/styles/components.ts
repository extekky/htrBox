/**
 * components.ts
 *
 * Готовые стили для компонентов проекта.
 *
 * Использование:
 *   import { styles } from "@/styles"
 *   className={styles.formInput.root}
 *
 * Структура каждого компонента:
 *   root      — корневой элемент
 *   [slot]    — именованные слоты внутри
 *
 * ПРАВИЛО: если ты пишешь className="..." в JSX — это ошибка.
 */

import { focus, radius, spacing, typography } from "@/styles/tokens";
import { transition } from "@/styles/animations";

// -------------------------------------------------------------
// FormInput — поле формы с лейблом, иконками и ошибкой
// -------------------------------------------------------------

export const formInput = {
  // Корневая обёртка — вертикальный стек: лейбл → инпут → ошибка
  root: `flex flex-col ${spacing.inlineGapSm}`,

  // position:relative — нужна для абсолютных иконок
  inputWrap: "relative",

  // Базовые стили инпута — общие для всех состояний
  input: [
    "w-full h-10 rounded-lg border",
    "bg-input text-sm text-foreground",
    "placeholder:text-muted-foreground/40",
    "[&::-webkit-calendar-picker-indicator]:invert",
    focus.input,
    transition.colors,
  ].join(" "),

  // Варианты border
  inputDefault: "border-border",
  inputError: "border-destructive focus:ring-destructive",

  // Варианты паддинга в зависимости от наличия иконок
  inputPadDefault: "px-3",
  inputPadLeft: "pl-9 pr-3",
  inputPadRight: "px-3 pr-10",
  inputPadBoth: "pl-9 pr-10",

  // Иконка слева — не перехватывает клики
  iconLeft:
    "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground",
  // Слот справа (глазик, кастомный контент)
  iconRight: "absolute right-3 top-1/2 -translate-y-1/2",

  // Кнопка показать/скрыть пароль
  eyeBtn: [
    "flex items-center justify-center",
    "text-muted-foreground hover:text-foreground",
    transition.colors,
  ].join(" "),

  // Текст ошибки под полем
  errorText: typography.errorText,
} as const;

// -------------------------------------------------------------
// NotifyBanner — информационный баннер с иконкой и крестиком
// -------------------------------------------------------------

export const notifyBanner = {
  // Корневая обёртка — горизонтальная строка: иконка → текст → крестик
  root: `${radius.lg} border px-4 py-3.5 flex items-center ${spacing.inlineGap}`,

  // Враппер иконки — цветной кружок, размер фиксирован
  iconWrap: `flex items-center justify-center w-8 h-8 ${radius.md} shrink-0`,

  // Текстовая зона — растягивается, обрезает длинный контент
  body: "flex-1 min-w-0",

  // Заголовок баннера — полужирный, цвет задаётся вариантом
  title: "text-sm font-semibold",

  // Описание под заголовком
  description: `${typography.hintText} mt-0.5 whitespace-pre-line`,

  // Кнопка закрытия
  closeBtn: [
    "shrink-0 flex items-center justify-center w-7 h-7",
    radius.sm,
    transition.colors,
  ].join(" "),
} as const;