/**
 * tokens.ts
 *
 * Семантические токены — атомарные строки классов.
 * Это фундамент всей дизайн-системы.
 *
 * ПРАВИЛА для разработчиков:
 *  1. Никогда не пиши Tailwind-классы в JSX напрямую — только через styles/
 *  2. Если паттерн встречается 2+ раза — он должен быть здесь
 *  3. Называй семантически: inputBase, не "grayBorder"
 */

// -------------------------------------------------------------
// Типографика
// -------------------------------------------------------------

export const typography = {
  // Заголовки страниц и секций
  displayLg:
    "text-[30px] leading-tight font-semibold tracking-tight text-foreground",
  displayMd:
    "text-[24px] leading-tight font-semibold tracking-tight text-foreground",
  displaySm:
    "text-[18px] leading-snug font-semibold tracking-tight text-foreground",

  // Заголовки карточек / модалок / страниц
  headingLg: "text-[17px] leading-snug font-semibold text-foreground",
  headingMd: "text-[15px] leading-snug font-semibold text-foreground",
  headingBase: "text-[14px] leading-snug font-semibold text-foreground",
  headingSm: "text-[13px] leading-snug font-medium text-foreground",

  // Метки над полями (caps, как в macOS System Preferences)
  labelCaps:
    "text-[11px] font-medium uppercase tracking-widest text-muted-foreground",
  labelSm: "text-[12px] font-medium text-muted-foreground",

  // Основной текст интерфейса
  bodyMd: "text-[14px] leading-[1.55] text-foreground",
  bodySm: "text-[13px] leading-[1.5] text-foreground",

  // Метка внутри компонента — 14px medium без leading (плотные layout'ы)
  componentMd: "text-[14px] leading-snug font-medium text-foreground",

  // Текст внутри поля ввода — размер и цвет, без leading (высота задана явно)
  inputText: "text-[14px] leading-none text-foreground",

  // Вспомогательный / второстепенный текст
  mutedMd: "text-[14px] leading-[1.5] text-muted-foreground",
  mutedSm: "text-[13px] leading-[1.45] text-muted-foreground",
  mutedXs: "text-[11px] leading-tight text-muted-foreground",

  // Числа / данные (tabular для выравнивания в таблицах и KPI)
  numericLg: "text-[28px] font-semibold tabular-nums text-foreground",
  numericMd: "text-[17px] font-semibold tabular-nums text-foreground",

  // URL code
  urlCode: "text-[12px] leading-relaxed text-foreground",

  // Сообщения под полями ввода
  errorText: "text-[12px] leading-tight text-destructive",
  hintText: "text-[12px] leading-tight text-muted-foreground",
} as const;

// -------------------------------------------------------------
// Поверхности
// -------------------------------------------------------------

export const surface = {
  // Базовый фон страницы
  page: "bg-background",

  // Карточка — белая с тонкой границей
  card: "bg-card border border-border/70",

  // Вложенная секция внутри карточки (чуть теплее)
  cardInner: "bg-secondary/55 border border-border/60",

  // Попоуэр / дропдаун / тултип
  popover: "bg-card border border-border/70 shadow-lg shadow-slate-900/8",

  // Поверхность с frosted-glass (для хедера / ботбара)
  frosted: "bg-background/90 backdrop-blur-xl border-border/60",

  // Выделенный элемент (например активная строка таблицы)
  highlighted: "bg-primary/8",
} as const;

// -------------------------------------------------------------
// Радиусы
// -------------------------------------------------------------

export const radius = {
  sm: "rounded-lg", // маленькие элементы: badges, теги, tooltip
  md: "rounded-xl", // кнопки, поля ввода, строки таблицы
  lg: "rounded-2xl", // карточки, панели
  xl: "rounded-3xl", // крупные блоки, модалки
  full: "rounded-full", // аватары, pill-кнопки, индикаторы
} as const;

// -------------------------------------------------------------
// Тени
// -------------------------------------------------------------

export const shadow = {
  none: "shadow-none",
  sm: "shadow-sm shadow-slate-900/6", // карточки в покое
  md: "shadow-md shadow-slate-900/8", // карточки при hover
  lg: "shadow-xl shadow-slate-900/10", // модалки, дропдауны
  xl: "shadow-2xl shadow-slate-900/14", // главный floating контент
} as const;

// -------------------------------------------------------------
// Отступы
// -------------------------------------------------------------

export const spacing = {
  // Внутренние отступы карточек
  cardPadding: "p-6",
  cardPaddingMd: "p-5",
  cardPaddingSm: "p-4",

  // Зазоры между секциями на странице
  sectionGap: "gap-8",
  sectionGapMd: "gap-6",
  sectionGapSm: "gap-4",

  // Зазоры внутри форм
  formGap: "gap-5",
  formGapSm: "gap-3",

  // Инлайн-зазоры (иконка + текст и т.д.)
  inlineGap: "gap-2",
  inlineGapSm: "gap-1.5",
} as const;

// -------------------------------------------------------------
// Состояния фокуса
// -------------------------------------------------------------

export const focus = {
  // Кнопки и интерактивные элементы
  ring: "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
  // Поля ввода — бордер меняет цвет
  input: "focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring/30",
} as const;

// -------------------------------------------------------------
// Disabled-состояния
// -------------------------------------------------------------

export const disabled = {
  base: "disabled:opacity-45 disabled:cursor-not-allowed disabled:pointer-events-none",
} as const;

// -------------------------------------------------------------
// Разделители
// -------------------------------------------------------------

export const divider = {
  horizontal: "border-t border-border",
  vertical: "border-l border-border",
  subtle: "border-t border-border/50",
} as const;
