/**
 * uiStls.ts
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

import {
  disabled,
  divider,
  focus,
  radius,
  shadow,
  spacing,
  surface,
  typography,
} from "@/styles/tokens";
import { loading, transition, enter, hover } from "@/styles/animations";
import { colorScheme } from "@/styles/variants";

// -------------------------------------------------------------
// Spinner — анимированный индикатор загрузки
// -------------------------------------------------------------

export const spinner = {
  // Базовый класс вращения
  base: loading.spin,

  // Размерные варианты
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
  xl: "size-8",
} as const;

// -------------------------------------------------------------
// Checkbox — кастомный чекбокс на базе Radix UI
// -------------------------------------------------------------

export const checkbox = {
  // Корневой элемент — геометрия, цвет границы, тень, анимация
  root: [
    "peer size-4 shrink-0 rounded-lg border shadow-xs outline-none",
    // Нейтральный фон/бордер заметнее на светлых таблицах, но остаётся мягким.
    "border-border/90 bg-muted/70 hover:border-border",
    transition.shadow,
  ].join(" "),

  // Состояние checked — заливка и цвет текущего цвета
  checked:
    "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary",

  // Стиль фокуса — специфичен (ring-[3px]), не совпадает с focus.ring
  focus:
    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",

  // Состояние invalid
  invalid: "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",

  // Состояние disabled — opacity-50 (не disabled.base): Radix сам блокирует
  // клики через disabled-атрибут, pointer-events-none здесь избыточен
  disabled: "disabled:cursor-not-allowed disabled:opacity-50",

  // Индикатор (враппер галочки)
  indicator: "flex items-center justify-center text-current transition-none",

  // Иконка галочки
  icon: "size-3.5",
} as const;

// -------------------------------------------------------------
// CopyButton — кнопка копирования в буфер обмена (два варианта)
// -------------------------------------------------------------

export const copyButton = {
  // --- icon-вариант ---

  // Корень icon-кнопки — геометрия, hover, фокус, disabled
  iconRoot: [
    "p-1.5 rounded-md",
    "text-muted-foreground hover:text-foreground hover:bg-secondary/90",
    "focus:outline-none focus:ring-2 focus:ring-primary/40",
    "disabled:opacity-40 disabled:cursor-not-allowed",
    transition.colors,
  ].join(" "),

  // Иконка галочки при состоянии "скопировано"
  iconCopied: "text-primary",

  // --- block-вариант ---

  // Корень block-кнопки — layout + геометрия + анимация + disabled
  blockRoot: [
    "flex w-full items-center justify-center gap-2.5",
    `${radius.md} border px-5 py-3.5 ${typography.componentMd}`,
    "active:scale-[0.98]",
    disabled.base,
    transition.base,
  ].join(" "),

  // Состояние "скопировано" — emerald совпадает с colorScheme.success
  blockCopied: "border-emerald-500/30 bg-emerald-500/14 text-emerald-700",

  // Базовое состояние
  blockDefault:
    "border-primary/30 bg-primary/14 text-primary hover:bg-primary/20",
} as const;

// -------------------------------------------------------------
// FormLabel — метка поля формы
// -------------------------------------------------------------

export const formLabel = {
  // Метка — caps, приглушённый цвет, увязана с typography.labelCaps
  root: typography.labelCaps,
} as const;

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
    "w-full h-10 rounded-lg border bg-input",
    typography.inputText,
    "placeholder:text-muted-foreground/55",
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
// DropdownMenu — выпадающее меню на базе Radix UI DropdownMenu
// -------------------------------------------------------------

export const dropdownMenu = {
  // Контейнер меню — поверхность, анимация, slide-in по стороне
  // rounded-md (не radius.sm=rounded-lg) — меньший радиус для compact-меню, осознанно
  content: [
    `bg-popover text-popover-foreground z-50 min-w-32 overflow-hidden rounded-md border p-1 ${shadow.md}`,
    enter.popover,
    "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
  ].join(" "),

  // Кликабельный пункт меню
  item: [
    "focus:bg-accent focus:text-accent-foreground",
    "data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
    `relative flex cursor-default items-center ${spacing.inlineGap} rounded-sm px-2 py-1.5 ${typography.bodySm} outline-none select-none`,
    "data-disabled:pointer-events-none data-disabled:opacity-50 data-inset:pl-8",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),

  // Некликабельный заголовок группы
  label: `px-2 py-1.5 ${typography.componentMd} data-inset:pl-8`,

  // Горизонтальный разделитель
  separator: "bg-border -mx-1 my-1 h-px",
} as const;

// -------------------------------------------------------------
// Modal — модальное окно на базе Radix UI Dialog
// -------------------------------------------------------------

export const modal = {
  // Затемняющий оверлей
  overlay: [
    "fixed inset-0 z-40 bg-black/45 backdrop-blur-sm",
    enter.overlay,
  ].join(" "),

  // Панель содержимого — позиционирование + форма + анимация
  content: [
    "fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
    `w-full bg-card border border-border/70 ${radius.lg} shadow-2xl shadow-slate-900/14`,
    enter.modal,
  ].join(" "),

  // Шапка — layout + нижний разделитель
  header:
    "flex items-start justify-between gap-4 px-5 py-4 border-b border-border/60",

  // Заголовок диалога
  title: typography.headingBase,

  // Описание под заголовком
  description: `${typography.hintText} mt-0.5`,

  // Кнопка закрытия (крестик)
  closeBtn: [
    "shrink-0 rounded-md p-1",
    "text-muted-foreground hover:bg-secondary hover:text-foreground",
    "focus:outline-none focus:ring-1 focus:ring-ring",
    transition.colors,
  ].join(" "),

  // Тело модалки
  body: "px-5 py-4",

  // Футер — layout + верхний разделитель
  footer: `flex items-center justify-end ${spacing.inlineGap} px-5 py-3 ${divider.horizontal}`,
} as const;

// -------------------------------------------------------------
// Card — составная карточка для группировки контента
// -------------------------------------------------------------

export const card = {
  // Корневой контейнер — поверхность + радиус + glass-утилита
  root: `${surface.card} ${radius.lg} glass`,

  // Шапка — вертикальный стек с gap и padding
  header: `flex flex-col ${spacing.inlineGapSm} ${spacing.cardPadding}`,

  // Заголовок карточки
  title: typography.headingLg,

  // Подзаголовок / описание
  description: typography.mutedSm,

  // Основное содержимое — padding без верхнего
  content: `${spacing.cardPadding} pt-0`,

  // Футер — горизонтальная строка с padding без верхнего
  footer: `flex items-center ${spacing.cardPadding} pt-0`,

  // Группа кнопок / элементов управления
  action: `flex items-center ${spacing.inlineGap}`,
} as const;

// -------------------------------------------------------------
// ModalActions — пара кнопок «Отмена / Подтвердить» для футера модалки
// -------------------------------------------------------------

export const modalActions = {
  // Общая геометрия для обеих кнопок
  btn: `h-9 px-4 ${radius.sm} ${typography.componentMd} ${transition.colors}`,

  // Кнопка «Отмена»
  btnCancel: "bg-secondary text-secondary-foreground hover:bg-secondary/80",

  // Кнопка «Подтвердить» — layout + цвет + disabled
  btnSubmit: [
    `inline-flex items-center ${spacing.inlineGap}`,
    "bg-primary/12 text-primary border border-primary/24 hover:bg-primary/18",
    disabled.base,
  ].join(" "),

  // Инлайн-спиннер внутри кнопки submit
  spinner: `h-3.5 w-3.5 rounded-full border-2 border-primary/30 border-t-primary ${loading.spin}`,
} as const;

// -------------------------------------------------------------
// ToggleCard — кликабельная карточка-переключатель для булевых полей
// -------------------------------------------------------------

export const toggleCard = {
  // Корневой элемент — layout, геометрия, cursor, анимация
  root: [
    "flex items-center justify-between",
    radius.md,
    "border px-4 py-3 cursor-pointer select-none",
    transition.colors,
  ].join(" "),

  // Состояние: выбрано — основная граница + светлый основной фон
  rootChecked: "border-primary/30 bg-primary/5",

  // Состояние: не выбрано — нейтральная граница + hover
  rootUnchecked: `border-border/70 ${hover.ghost}`,

  // Текстовый блок — метка
  label: typography.componentMd,

  // Текстовый блок — описание под меткой
  description: `${typography.hintText} mt-0.5`,

  // Круглый индикатор — геометрия + анимация
  indicator: `h-4 w-4 ${radius.full} border-2 ${transition.colors}`,

  // Индикатор: выбрано
  indicatorChecked: "border-primary bg-primary",

  // Индикатор: не выбрано
  indicatorUnchecked: "border-border bg-transparent",
} as const;

// -------------------------------------------------------------
// ActiveToggle — переключатель активности сервера
// -------------------------------------------------------------

export const activeToggle = {
  root: [
    "relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent",
    "transition-colors duration-200 ease-in-out",
    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ].join(" "),
  on: colorScheme.success.solid,
  off: "bg-secondary",
  thumb: [
    "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow",
    "transition-transform duration-200 ease-in-out",
  ].join(" "),
  thumbOn: "translate-x-4",
  thumbOff: "translate-x-0",
} as const;
