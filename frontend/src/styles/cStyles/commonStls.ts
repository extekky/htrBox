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

import { radius, surface, spacing, typography, shadow } from "@/styles/tokens";
import { transition, enter } from "@/styles/animations";
import { colorScheme } from "@/styles/variants";

// -------------------------------------------------------------
// ProgressBar — горизонтальный индикатор прогресса
// -------------------------------------------------------------

export const progressBar = {
  // Корневой трек — тонкая полоса с bg-muted и обрезкой
  root: `h-1.5 w-full ${radius.full} bg-muted/80 overflow-hidden`,

  // Заполнение трека — высота + форма + замедленная анимация ширины (500ms — медленнее transition.slow намеренно)
  track: `h-full ${radius.full} ${transition.slow} duration-500`,

  // Цветовые варианты заполнения — берём solid из colorScheme
  fillDanger: "bg-gradient-to-r from-destructive to-red-500", // bg-destructive
  fillWarning: "bg-gradient-to-r from-amber-500 to-amber-400", // bg-amber-500
  fillPrimary: "bg-gradient-to-r from-primary to-indigo-500/90", // bg-primary
  fillMuted: "bg-muted-foreground/35", // нет совпадения в colorScheme.solid
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
  allowed: `${colorScheme.success.bg} ${colorScheme.success.border} ${colorScheme.success.text}`,

  // Заблокирован / критично / истёк — danger
  danger: `${colorScheme.danger.bg} ${colorScheme.danger.text} ${colorScheme.danger.border}`,

  // Активен — primary
  primary: `${colorScheme.primary.bg} ${colorScheme.primary.text} ${colorScheme.primary.border}`,

  // Роль Админ — amber с приглушённым текстом (/90)
  admin: `${colorScheme.warning.bg} ${colorScheme.warning.border} text-amber-700`,

  // Предупреждение (expiry warning) — amber с повышенным контрастом (dark-aware)
  warning: `${colorScheme.warning.bg} ${colorScheme.warning.border} text-amber-700`,
} as const;

// -------------------------------------------------------------
// Toaster — всплывающие уведомления на базе Radix UI Toast
// -------------------------------------------------------------

export const toaster = {
  // Viewport — позиционирование стека уведомлений
  viewport: [
    "fixed bottom-4 right-4 z-100 outline-none",
    "flex max-h-screen w-full max-w-104 flex-col-reverse gap-2 p-4",
    "sm:bottom-8 sm:right-8 sm:flex-col sm:p-0",
  ].join(" "),

  // Корень одного тоста — геометрия, тень
  root: "group relative w-full overflow-hidden rounded-xl border border-border/70 p-4 shadow-lg shadow-slate-900/12",

  // Анимации входа / выхода (Radix data-state)
  animate: [
    "data-[state=open]:animate-in data-[state=open]:fade-in",
    "data-[state=open]:slide-in-from-top-full sm:data-[state=open]:slide-in-from-bottom-full",
    "data-[state=closed]:animate-out data-[state=closed]:fade-out-80",
    "data-[state=closed]:slide-out-to-right-full",
  ].join(" "),

  // Цветовые варианты корня — фон, рамка, текст
  variantDefault: `${surface.card} text-foreground`,
  variantDestructive: `${colorScheme.danger.bg} ${colorScheme.danger.border} ${colorScheme.danger.text}`,
  variantSuccess: `${colorScheme.success.bg} ${colorScheme.success.border} ${colorScheme.success.text}`,

  // Прогресс-бар внизу тоста
  progress: "absolute bottom-0 left-0 h-1 w-full origin-left animate-shrink",

  // Цветовые варианты прогресс-бара
  progressDefault: "bg-primary/35",
  progressDestructive: colorScheme.danger.solid,
  progressSuccess: colorScheme.success.solid,

  // Внутренний layout
  header: "flex items-start justify-between gap-3",
  body: "grid flex-1 gap-1",

  // Текстовые слоты
  title: "text-sm font-semibold leading-tight",
  description: "text-sm leading-relaxed text-muted-foreground",

  // Кнопка закрытия
  closeBtn: [
    "rounded-md p-1.5 text-muted-foreground opacity-70",
    "transition-opacity hover:opacity-100 focus:opacity-100",
    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  ].join(" "),
  closeIcon: "h-4 w-4",
} as const;

// -------------------------------------------------------------
// ServerSelector — список серверов для выбора
// -------------------------------------------------------------

export const serverSelector = {
  // Пустое состояние — центрированная колонка
  empty: "flex flex-col items-center gap-2 py-6 text-center",

  // Иконка пустого состояния — квадратный кружок
  emptyIcon: `flex items-center justify-center w-10 h-10 ${radius.md} bg-muted/80 text-muted-foreground/55`,

  // Текст пустого состояния
  emptyTitle: typography.componentMd,
  emptyHint: "text-xs text-muted-foreground mt-0.5",

  // Список серверов
  list: "flex flex-col gap-1.5",

  // Кнопка одного сервера — базовая геометрия + анимация
  item: `w-full flex items-center gap-3 ${radius.md} px-3 py-2.5 text-left border transition-all duration-150`,

  // Состояния кнопки
  itemSelected: "bg-primary/12 border-primary/28 shadow-sm shadow-primary/12",
  itemDefault:
    "border-border/45 bg-card/75 hover:bg-muted/55 hover:border-border/70",

  // Radio-индикатор
  radio: `w-4 h-4 ${radius.full} border-[1.5px] shrink-0 flex items-center justify-center transition-colors`,
  radioSelected: `border-primary/45 ${colorScheme.primary.bg}`,
  radioDefault: "border-muted-foreground/35 bg-card",

  // Точка внутри radio при выборе
  radioDot: `w-2 h-2 ${radius.full} bg-primary`,

  // Тело кнопки — текстовый блок
  itemBody: "flex-1 min-w-0",

  // Название страны
  itemNameSelected: "text-sm font-semibold truncate text-foreground",
  itemNameDefault: "text-sm font-medium truncate text-foreground/88",

  // Город
  itemCity: `${typography.mutedXs} truncate mt-0.5`,
} as const;

// -------------------------------------------------------------
// ConnectionCard — карточка подключения с VPN-ключом
// -------------------------------------------------------------

export const connectionCard = {
  // Корневой контейнер
  root: "p-4.5 flex flex-col gap-3.5",

  // Шапка — заголовок + кнопка обновления
  header: "flex items-start justify-between gap-3",
  headerLeft: "flex items-center gap-2.5",

  // Иконка ссылки — нестандартный радиус rounded-[9px]
  iconWrap:
    "flex items-center justify-center w-8 h-8 rounded-[10px] bg-primary/12 text-primary shrink-0 border border-primary/20",

  // Заголовок и подпись
  title: "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
  subtitle: `${typography.mutedXs} mt-1`,

  // Кнопка обновления
  refreshBtn: [
    "flex items-center justify-center px-3 h-8 rounded-lg gap-2 shrink-0",
    `${colorScheme.primary.border} ${colorScheme.primary.bg} text-primary border`,
    "hover:bg-primary/18 hover:text-primary",
    "transition-colors disabled:opacity-40",
  ].join(" "),
  refreshLabel: "text-xs font-medium",

  // Бейдж выбранного сервера
  serverBadge: `inline-flex items-center gap-1.5 self-start px-2.5 py-1 ${radius.full} bg-muted/75 border border-border/70`,
  serverDot: `w-1.5 h-1.5 ${radius.full} ${colorScheme.success.solid} shrink-0`,
  serverCountry: "text-xs text-foreground font-medium",
  serverCity: "text-xs text-muted-foreground",

  // Состояния основной области
  statePlaceholder: `flex items-center justify-center h-10 ${radius.md} border border-dashed border-border/70 bg-muted/20 text-sm text-muted-foreground`,
  stateLoading: `flex items-center justify-center h-10 ${radius.md} bg-muted/20 text-sm text-muted-foreground gap-2`,

  // Блок с URL
  urlBox: `${radius.md} border border-border/70 bg-muted/35 px-3 py-2.5`,
  urlLabel: `${typography.labelCaps} text-[9px] tracking-[0.09em] mb-1.5`,
  urlCode: `${typography.urlCode} text-[11px] font-mono break-all select-all leading-relaxed`,
} as const;

// -------------------------------------------------------------
// Guide — онбординг-гайд с шагами подключения
// -------------------------------------------------------------

export const guide = {
  // Корневой контейнер
  root: `${radius.lg} ${surface.card} ${spacing.cardPaddingMd} glass shadow-lg shadow-slate-900/8`,

  // Заголовок гайда
  guideTitle: "mb-2 text-base font-semibold text-foreground tracking-tight",

  // Вводный блок
  intro: `${radius.md} border border-border/60 bg-muted/35 px-4 py-3.5 mb-5 space-y-2`,
  introText: "text-sm text-muted-foreground leading-relaxed",
  introMeta: "flex flex-wrap items-center gap-2",
  introMetaItem: `inline-flex items-center gap-1.5 ${radius.full} px-2.5 py-1 text-[11px] font-medium border border-border/70 bg-card text-foreground`,

  // Обёртка списка шагов
  stepsWrap: "space-y-2",

  // ── Row ──────────────────────────────────────────────────────
  // Базовая строка иконка + текст
  row: "flex items-start gap-2.5",

  // Обёртка иконки
  rowIcon: "shrink-0 flex items-center justify-center",

  // Текст строки
  rowText: "min-w-0 text-sm leading-relaxed text-foreground",

  // ── Badge ────────────────────────────────────────────────────
  // Инлайн-бейдж с иконкой
  badge: `inline-flex items-center gap-1 ${radius.sm} border border-primary/30 ${colorScheme.primary.bg} px-2 py-0.5 text-xs font-semibold ${colorScheme.primary.text} leading-snug`,

  // ── Step ─────────────────────────────────────────────────────
  // Корневой flex шага
  stepRoot: "flex gap-4",

  // Левая колонка: номер + линия
  stepAside: "flex flex-col items-center",

  // Кружок с номером шага
  stepNumber: `flex size-8 shrink-0 items-center justify-center ${radius.full} border border-primary/40 ${colorScheme.primary.bg} text-sm font-semibold ${colorScheme.primary.text}`,

  // Вертикальная линия между шагами
  stepLine: `mt-1 w-0.5 flex-1 min-h-6 ${radius.full} bg-primary/20`,

  // Тело шага (обычное)
  stepBody: "flex-1 pb-6",

  // Тело последнего шага
  stepBodyLast: "flex-1 pb-2",

  // Строка-заголовок шага (Row с mb)
  stepTitleRow: "mb-1.5",

  // Обёртка иконки в заголовке шага
  stepIconWrap: `${colorScheme.primary.text} flex items-center`,

  // Текст заголовка шага
  stepTitle: "text-[15px] font-semibold text-foreground leading-snug",
  stepHint: "mb-3 text-xs text-muted-foreground leading-relaxed",
  stepKey: "font-semibold text-foreground",
  stepCode: `inline-flex items-center ${radius.sm} border border-border/70 bg-card px-1.5 py-0.5 text-[11px] font-medium text-foreground`,
  selectedBadge: `inline-flex items-center ${spacing.inlineGapSm} ${radius.full} px-2.5 py-1 border border-primary/28 ${colorScheme.primary.bg} text-[11px] font-medium ${colorScheme.primary.text}`,

  // ── PlatformButton ───────────────────────────────────────────
  // Базовая кнопка платформы
  platformBtn: `flex flex-col items-center gap-1.5 px-3 py-2.5 ${radius.md} border ${transition.base} shrink-0`,

  // Выбранное состояние
  platformBtnSelected: `border-primary/36 ${colorScheme.primary.bg} ${colorScheme.primary.text}`,

  // Невыбранное состояние
  platformBtnDefault:
    "border-border/55 bg-muted/35 text-muted-foreground hover:border-border/80 hover:text-foreground hover:bg-muted/55",

  // Иконка платформы
  platformBtnIcon: "flex items-center justify-center",

  // Подпись платформы
  platformBtnLabel: "text-[11px] font-medium leading-none",

  // ── ClientCard ───────────────────────────────────────────────
  // Карточка выбранного клиента
  clientCard: `animate-fade-in flex items-center justify-between gap-3 ${radius.md} border border-border/55 bg-muted/35 px-4 py-3`,

  // Левый блок карточки
  clientCardBody: "min-w-0",

  // Имя клиента
  clientName: "text-sm font-semibold text-foreground leading-none mb-1",

  // Описание клиента
  clientDesc: "text-xs text-muted-foreground leading-relaxed",

  // Ссылка скачать
  clientDownloadLink: `inline-flex items-center gap-1 text-xs font-medium ${colorScheme.primary.text} hover:underline shrink-0`,

  // ── InfoBlock ────────────────────────────────────────────────
  // Обёртка информационного блока
  infoBlock: `${radius.md} border border-border/55 bg-muted/35 px-4 py-3.5 space-y-2.5`,
  infoText: "text-sm text-muted-foreground leading-relaxed",
  infoList: "space-y-2",
  infoListItem:
    "relative pl-4 text-sm text-muted-foreground leading-relaxed before:absolute before:left-0.5 before:top-[0.62em] before:size-1.5 before:rounded-full before:bg-primary/45",
  pendingNote: `${radius.md} border border-dashed border-border/75 bg-card/80 px-3.5 py-3`,
  pendingTitle: "text-sm font-medium text-foreground",
  pendingText: "mt-1 text-xs text-muted-foreground leading-relaxed",

  // Разделитель внутри InfoBlock
  infoSeparator: "h-px bg-border/40",

  // ── Шаг 2 — секция выбора платформы ─────────────────────────
  platformSection: "flex flex-col gap-3",
  platformHint: "text-sm text-muted-foreground leading-relaxed",
  platformGrid: "flex flex-col gap-2",
  platformRow3: "grid grid-cols-3 gap-2",
  platformRow2: "grid grid-cols-2 gap-2",

  // ── Шаг 1 — ссылка на Telegram ───────────────────────────────
  telegramLink: `flex items-center gap-3 ${radius.sm} border ${colorScheme.primary.border} ${colorScheme.primary.bg} px-3 py-2.5 ${colorScheme.primary.hover} ${transition.colors}`,
  telegramAvatar: `flex size-8 shrink-0 items-center justify-center ${radius.full} ${colorScheme.primary.bg} ${colorScheme.primary.text}`,
  telegramBody: "min-w-0 flex-1",
  telegramName: `text-sm font-semibold ${colorScheme.primary.text} leading-none mb-1`,
  telegramPlatformLabel: "text-xs text-muted-foreground leading-none",
  telegramExternalIcon: "shrink-0 text-primary/50",

  // ── Шаг 5/6 — финальные блоки ───────────────────────────────
  successRow: `${radius.sm} ${colorScheme.success.bg} border ${colorScheme.success.border} px-3 py-2 ${colorScheme.success.text} text-sm leading-relaxed`,
  successAvatar: `flex size-8 shrink-0 items-center justify-center ${radius.full} ${colorScheme.success.bg} ${colorScheme.success.text}`,
  successTitle: `text-sm font-semibold ${colorScheme.success.text}`,
  successDesc: "text-sm text-muted-foreground leading-relaxed",
  troubleList: "space-y-2",
  troubleItem:
    "text-sm text-muted-foreground leading-relaxed border border-border/55 bg-card/85 rounded-lg px-3 py-2.5",
  supportLink:
    "inline-flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium bg-primary/12 text-primary border border-primary/24 hover:bg-primary/18 transition-colors",

  // ── Кнопка «+» инлайн ────────────────────────────────────────
  plusBadge: `inline-flex size-5 shrink-0 items-center justify-center ${radius.full} border border-primary/34 ${colorScheme.primary.bg} ${colorScheme.primary.text}`,
} as const;

// -------------------------------------------------------------
// ConfirmDialog — модальное окно подтверждения действий
// -------------------------------------------------------------

export const confirmDialog = {
  // Затемнение фона
  overlay: [
    "fixed inset-0 z-40 bg-black/45 backdrop-blur-sm",
    enter.overlay,
  ].join(" "),

  // Панель диалога — позиционирование + геометрия + анимация
  content: [
    "fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
    `w-full max-w-sm ${surface.card} ${radius.lg} ${shadow.xl}`,
    `${enter.modal} ${spacing.cardPaddingMd} flex flex-col gap-4`,
  ].join(" "),

  // Блок заголовка и описания
  textBlock: "flex flex-col gap-1.5",

  // Заголовок
  title: typography.headingBase,

  // Описание
  description: typography.mutedMd,

  // Строка кнопок
  actions: "flex items-center justify-end gap-2",

  // Кнопка отмены
  cancelBtn: [
    "h-8 px-3 rounded-lg text-xs font-medium",
    "bg-secondary text-secondary-foreground",
    "hover:bg-secondary/90 transition-colors",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ].join(" "),

  // База кнопки подтверждения — общая геометрия
  confirmBtnBase: [
    "h-8 px-3 rounded-lg text-xs font-medium",
    "inline-flex items-center gap-1.5",
    "transition-colors active:scale-[0.97]",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ].join(" "),

  // Вариант destructive — красная кнопка удаления
  confirmBtnDestructive: `${colorScheme.danger.solid} text-destructive-foreground hover:bg-destructive/90`,

  // Вариант default — primary-кнопка
  confirmBtnDefault: `${colorScheme.primary.bg} ${colorScheme.primary.text} ${colorScheme.primary.border} ${colorScheme.primary.hover}`,
} as const;

// -------------------------------------------------------------
// NotifyBanner — информационный баннер с иконкой и крестиком
// -------------------------------------------------------------

export const notifyBanner = {
  // Корневая обёртка — горизонтальная строка: иконка → текст → крестик
  root: `${radius.lg} border px-4 py-3.5 flex items-center ${spacing.inlineGap} shadow-sm shadow-slate-900/6`,

  // Враппер иконки — цветной кружок, размер фиксирован
  iconWrap: `flex items-center justify-center w-8 h-8 ${radius.md} shrink-0`,

  // Текстовая зона — растягивается, обрезает длинный контент
  body: "flex-1 min-w-0",

  // Заголовок баннера — полужирный, цвет задаётся вариантом colorScheme
  title: "font-semibold text-[14px] leading-snug tracking-tight",

  // Описание под заголовком
  description:
    "mt-0.5 text-[12px] leading-relaxed text-muted-foreground whitespace-pre-line",

  // Кнопка закрытия
  closeBtn: [
    "shrink-0 flex items-center justify-center w-7 h-7",
    radius.sm,
    transition.colors,
  ].join(" "),
} as const;
