/**
 * pagesStls.ts
 *
 * Готовые стили для компонентов проекта.
 *
 * Использование:
 *   import { styles } from "@/styles"
 *   className={styles.profilePage.root}
 *
 * Структура каждого компонента:
 *   root      — корневой элемент
 *   [slot]    — именованные слоты внутри
 *
 * ПРАВИЛО: если ты пишешь className="" в JSX — это ошибка.
 */

import { loading, transition } from "@/styles/animations";
import { colorScheme } from "@/styles/variants";
import { typography, radius, spacing } from "@/styles/tokens";

// -------------------------------------------------------------
// LoginPage — страница входа
// -------------------------------------------------------------

export const loginPage = {
  restoreRoot:
    "flex items-center justify-center min-h-screen bg-background gradient-page",
  restoreInner: "flex flex-col items-center gap-3 text-muted-foreground",
  restoreIcon: loading.spin,
  restoreText: "text-sm",

  root: "relative flex items-center justify-center min-h-screen overflow-hidden bg-background gradient-page",
  inner: "relative z-10 w-full max-w-sm mx-4 animate-fade-in",

  header: "flex flex-col items-center gap-3 mb-5 text-center",
  title: "text-xl font-semibold tracking-tight text-foreground",
  subtitle: "text-sm text-muted-foreground mt-0.5",

  card: "card-auth",
  cardContent: "p-6",
  form: `flex flex-col ${spacing.sectionGapSm}`,

  submitButton: [
    `mt-1 h-10 w-full ${radius.sm}`,
    "text-sm font-medium",
    "bg-primary text-primary-foreground hover:bg-primary/92",
    "active:scale-[0.98]",
    transition.base,
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "flex items-center justify-center gap-2",
  ].join(" "),
  submitIcon: loading.spin,

  footer: "flex items-center justify-center mt-5",
  footerLink:
    "inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors",
} as const;

// -------------------------------------------------------------
// RegisterPage — страница регистрации
// -------------------------------------------------------------

export const registerPage = {
  root: "relative flex items-center justify-center min-h-screen overflow-hidden bg-background gradient-page",
  inner: "relative z-10 w-full max-w-sm mx-4 animate-fade-in",

  header: "flex flex-col items-center gap-3 mb-5 text-center",
  title: "text-xl font-semibold tracking-tight text-foreground",
  subtitle: "text-sm text-muted-foreground mt-0.5",

  card: "card-auth",
  cardContent: "p-6",
  form: `flex flex-col ${spacing.sectionGapSm}`,

  submitButton: [
    `mt-1 h-10 w-full ${radius.sm}`,
    "text-sm font-medium",
    "bg-primary text-primary-foreground hover:bg-primary/92",
    "active:scale-[0.98]",
    transition.base,
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "flex items-center justify-center gap-2",
  ].join(" "),
  submitIcon: loading.spin,

  footer: "flex items-center justify-center mt-5",
  footerLink:
    "inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors",
} as const;

// -------------------------------------------------------------
// ProfilePage — страница профиля пользователя
// -------------------------------------------------------------

export const profilePage = {
  // Состояние загрузки / ошибки — центрированная обёртка
  stateWrap: "flex justify-center items-center flex-1 py-20",

  // Внутренний блок состояния ошибки
  stateInner: "flex flex-col items-center gap-3 text-center px-6",

  // Иконка состояния ошибки — круглый контейнер
  stateIconWrap: `flex items-center justify-center w-12 h-12 ${radius.full} ${colorScheme.danger.bg}`,

  // Иконка состояния ошибки — цвет
  stateIcon: colorScheme.danger.text,

  // Заголовок состояния ошибки
  stateTitle: typography.componentMd,

  // Подсказка состояния ошибки
  stateHint: typography.hintText,

  // Внешний контейнер страницы
  root: "flex justify-center py-8 px-4",

  // Внутренняя колонка с контентом
  inner: "w-full max-w-150 flex flex-col gap-4 animate-fade-in",

  // Hero-карточка — плотная, адаптивная шапка профиля
  heroCard:
    "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 p-4 sm:gap-x-4 sm:p-5",

  // Hero — левая часть: аватар + текст
  heroIdentity: "flex min-w-0 items-start gap-3 sm:gap-4",

  heroAvatar: "shrink-0 self-start",

  // Hero — текстовый блок рядом с аватаром
  heroContent: "min-w-0 flex-1",

  // Hero — группа имя + метаданные
  heroNameWrap: "flex min-w-0 flex-col gap-1.5",

  heroNameRow: "flex min-w-0 flex-wrap items-center gap-2",

  // Hero — имя пользователя
  heroName:
    "min-w-0 truncate text-lg font-bold leading-tight text-foreground sm:text-xl",

  // Hero — строка роли и пользовательских статусов
  heroMetaRow: "flex flex-wrap items-center gap-x-2.5 gap-y-1.5",

  // Hero — блок даты справа
  heroExpiry:
    "flex flex-col shrink-0 self-center items-end justify-center gap-0.5 text-right sm:min-w-48",

  // Hero — метка «Подписка до»
  heroExpiryLabel: typography.mutedXs,

  // Hero — значение даты
  heroExpiryDate: "text-xs leading-tight text-foreground",

  // Hero — значение времени
  heroExpiryTime: "text-xs leading-tight text-foreground",

  heroExpiryHint: "mt-1 text-[11px] text-muted-foreground",

  // Hero — роль пользователя
  heroRole: "text-xs text-muted-foreground shrink-0",

  heroStatuses: "min-w-0",

  // Сетка статистики (2 колонки)
  statsGrid: "grid grid-cols-2 gap-3",

  // Карточка-плитка статистики
  statCard: `px-4 py-4 flex flex-col ${spacing.formGapSm}`,

  // Тело статистической плитки — единая структура без искусственного роста по высоте
  statBody: "flex-1",

  // Метка плитки — caps-стиль
  // tracking-wider намеренно отличается от labelCaps (tracking-widest) — меньше разрядка
  statLabel:
    "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",

  // Основное значение плитки
  statValue: "text-2xl font-bold text-foreground tabular-nums leading-none",

  // Первая строка контента плитки (главное значение)
  statPrimaryRow: "flex items-baseline",

  // Единица измерения основного значения
  statUnit: "text-sm font-normal text-muted-foreground ml-1",

  // Подпись под основным значением (из ... GB)
  statSub: typography.mutedXs,

  // Вторая строка контента плитки (подпись / статус)
  statSecondaryRow: "mt-1",

  // Строка значения подписки (иконка + число + единица)
  subValueWrap: "flex items-baseline gap-1.5",

  // Значение подписки (цвет приходит снаружи)
  subValue: "text-2xl font-bold tabular-nums leading-none",

  // Единица подписки (дн.)
  subUnit: "text-sm font-normal text-muted-foreground",

  // Подпись под значением подписки
  subValueSub: typography.mutedXs,

  // Цветовые тона значения подписки
  subValueToneDefault: colorScheme.neutral.text,
  subValueToneWarning: "text-amber-500",
  subValueToneDanger: colorScheme.danger.text,

  // Карточка подключения — скрывает overflow для разделителя
  connectionCard: "overflow-hidden",

  // Разделитель между ConnectionCard и блоком серверов
  connectionDivider: "h-px bg-border/70 mx-5",

  // Секция выбора сервера
  serverSection: "p-5 pt-4",

  // Заголовок блока серверов
  serverHeader: "flex items-center justify-between mb-3",

  // Метка «Сервер»
  serverLabel:
    "text-xs font-semibold uppercase tracking-wider text-muted-foreground",

  // Счётчик доступных серверов
  serverCount: typography.mutedXs,

  // Заглушка — нет серверов
  emptyState: "flex flex-col items-center gap-2 py-6 text-center",

  // Иконка заглушки
  emptyIcon: `flex items-center justify-center w-10 h-10 ${radius.md} bg-muted text-muted-foreground`,

  // Текстовый блок заглушки
  emptyText: "space-y-1",

  // Заголовок заглушки
  emptyTitle: typography.componentMd,

  // Подсказка заглушки
  emptyHint: "text-xs text-muted-foreground px-4",

  statusModalBody: "flex flex-col gap-4",
  statusModalStatus: "justify-center",
  statusModalText: "text-sm leading-relaxed text-muted-foreground",
} as const;

// -------------------------------------------------------------
// SettingsPage — настройки аккаунта и VPN
// -------------------------------------------------------------

export const settingsPage = {
  root: "flex justify-center py-8 px-4",
  inner: "w-full max-w-150 flex flex-col gap-4 animate-fade-in",

  header: "mb-1",
  title: "text-xl font-bold text-foreground tracking-tight",
  subtitle: "text-sm text-muted-foreground mt-0.5",

  sectionHeader: "flex-row items-start gap-4 p-5 pb-0",
  sectionIconWrap: `flex items-center justify-center w-10 h-10 rounded-xl shrink-0 mt-0.5 ${colorScheme.primary.bg} ${colorScheme.primary.text}`,
  sectionInfo: "flex-1",
  sectionTitle: "text-base",
  sectionDescription: "mt-1",

  hysteriaContent: "p-5 pt-4",
  accountContent: "p-5 pt-5",
  accountForm: "flex flex-col gap-4",

  actionButton: [
    "inline-flex items-center gap-2",
    "h-10 px-5 rounded-xl text-sm font-medium",
    `${colorScheme.primary.bg} ${colorScheme.primary.text} border ${colorScheme.primary.border}`,
    colorScheme.primary.hover,
    transition.colors,
    "disabled:opacity-60 disabled:pointer-events-none",
  ].join(" "),
  saveButton: [
    "inline-flex items-center gap-2",
    "h-10 px-6 rounded-xl text-sm font-medium",
    `${colorScheme.primary.bg} ${colorScheme.primary.text} border ${colorScheme.primary.border}`,
    colorScheme.primary.hover,
    transition.colors,
    "disabled:opacity-60 disabled:pointer-events-none",
  ].join(" "),
  spinIcon: loading.spin,

  applyHyLabel: "flex items-center gap-2.5 cursor-pointer select-none",
  applyHyText: "text-sm text-muted-foreground",

  actions:
    "flex items-center justify-between gap-4 pt-4 border-t border-border",
  togglePasswordButton:
    "inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors",
} as const;

// -------------------------------------------------------------
// ManualPage — правила и справка
// -------------------------------------------------------------

export const manualPage = {
  root: "flex justify-center py-8 px-4",
  inner: "w-full max-w-150 flex flex-col gap-4 animate-fade-in",

  title: "text-xl font-bold text-foreground tracking-tight",
  subtitle: "text-sm text-muted-foreground mt-0.5",
  sections: "flex flex-col gap-3",

  sectionCard: "overflow-hidden transition-colors duration-200",
  sectionCardClosed: "border-border/60 hover:border-border/90",
  sectionButton:
    "w-full flex items-center justify-between px-5 py-4 hover:bg-muted/45 transition-colors text-left",
  sectionHead: "flex items-center gap-3",
  sectionAccentBase:
    "flex items-center justify-center w-8 h-8 rounded-xl shrink-0",
  sectionAccentPrimary: `${colorScheme.primary.bg} ${colorScheme.primary.text}`,
  sectionAccentEmerald: `${colorScheme.success.bg} ${colorScheme.success.text}`,
  sectionAccentAmber: `${colorScheme.warning.bg} ${colorScheme.warning.text}`,
  sectionAccentBlue: `${colorScheme.info.bg} ${colorScheme.info.text}`,
  sectionAccentRose: "bg-rose-500/10 text-rose-500",
  sectionTitle: "text-sm font-semibold text-foreground",
  sectionChevron:
    "text-muted-foreground shrink-0 transition-transform duration-200",
  sectionChevronOpen: "rotate-180",
  sectionBody:
    "px-5 pb-5 pt-1 border-t border-border/60 text-sm text-foreground leading-relaxed",

  sectionInner: "flex flex-col gap-3 pt-3",
  sectionInnerRules: "flex flex-col gap-2.5 pt-3",

  textMuted: "text-muted-foreground",
  textStrong: "text-foreground",

  aboutTiles: "grid grid-cols-2 gap-2",
  aboutTile:
    "flex items-center gap-2.5 p-3 rounded-xl bg-muted/50 border border-border/60",
  aboutTileIcon: "text-primary shrink-0",
  aboutTileText: "text-xs text-muted-foreground",

  statusCard: "flex items-center gap-3 p-4 rounded-xl border",
  statusIcon: "shrink-0 mt-0.5",
  statusLabel: "text-sm font-semibold",
  statusDescription: "text-sm text-muted-foreground mt-0.5",
  statusSuccessWrap: `${colorScheme.success.bg} ${colorScheme.success.border}`,
  statusSuccessIcon: colorScheme.success.text,
  statusSuccessLabel: colorScheme.success.text,
  statusWarningWrap: `${colorScheme.warning.bg} ${colorScheme.warning.border}`,
  statusWarningIcon: colorScheme.warning.text,
  statusWarningLabel: colorScheme.warning.text,
  statusMutedWrap: "bg-secondary/80 border-border/70",
  statusMutedIcon: "text-muted-foreground",
  statusMutedLabel: "text-foreground",

  ruleCard: "flex gap-3 p-3 rounded-xl border items-center",
  ruleIcon: "shrink-0 mt-0.5",
  ruleText: "text-sm leading-relaxed",
  ruleDefaultWrap: "bg-secondary/80 border-border/70",
  ruleDefaultIcon: colorScheme.primary.text,
  ruleDefaultText: "text-muted-foreground",
  ruleWarningWrap: `${colorScheme.warning.bg} ${colorScheme.warning.border}`,
  ruleWarningIcon: colorScheme.warning.text,
  ruleWarningText: colorScheme.warning.text,
  ruleDangerWrap: `${colorScheme.danger.bg} ${colorScheme.danger.border}`,
  ruleDangerIcon: colorScheme.danger.text,
  ruleDangerText: colorScheme.danger.text,

  note: "flex items-start gap-2.5 px-3.5 py-3 rounded-xl border text-xs",
  noteIcon: "shrink-0 mt-0.5",
  noteDefaultWrap: "bg-muted/50 border-border/60 text-muted-foreground",
  noteDefaultIcon: "text-muted-foreground",
  noteWarningWrap: `${colorScheme.warning.bg} ${colorScheme.warning.border} ${colorScheme.warning.text}`,
  noteWarningIcon: colorScheme.warning.text,

  paymentGrid: "grid grid-cols-1 sm:grid-cols-2 gap-3",
  paymentPlanCard: `flex flex-col gap-3 p-4 ${radius.lg} ${colorScheme.success.bg} border ${colorScheme.success.border}`,
  paymentPlanHeader: "flex items-center gap-2",
  paymentPlanIcon: colorScheme.success.text,
  paymentPlanTitle: `text-xs font-bold uppercase tracking-widest ${colorScheme.success.text}`,
  paymentPrice: "flex items-end gap-1",
  paymentPriceValue: "text-3xl font-black text-foreground leading-none",
  paymentPriceUnit: "text-sm text-muted-foreground mb-0.5",
  paymentFeatures: "flex flex-col gap-1.5 pt-2 border-t border-emerald-500/20",
  paymentFeature: "flex items-center gap-2 text-xs text-muted-foreground",
  paymentFeatureIcon: `${colorScheme.success.text} shrink-0`,

  paymentHelp:
    "flex gap-3 p-4 rounded-xl bg-secondary/70 border border-border items-center",
  paymentHelpIcon: "text-primary shrink-0 mt-0.5",
  paymentHelpTitle: "text-sm font-medium text-foreground",
  paymentHelpText: "text-sm text-muted-foreground mt-0.5",

  supportLink:
    "self-start inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-sm font-medium bg-primary/12 text-primary border border-primary/24 hover:bg-primary/18 transition-colors",
} as const;

// -------------------------------------------------------------
// AdminBoard — дашборд администратора
// -------------------------------------------------------------

export const adminBoardPage = {
  loadingWrap: "flex items-center justify-center flex-1 py-32",

  errorWrap: "flex items-center justify-center flex-1 py-32 px-6",
  errorInner: "flex flex-col items-center gap-3 text-center",
  errorIconWrap: `flex items-center justify-center w-11 h-11 ${radius.lg} ${colorScheme.danger.bg} border ${colorScheme.danger.border}`,
  errorIcon: colorScheme.danger.text,
  errorTitle: "text-sm font-medium text-foreground",
  errorHint: "text-xs text-muted-foreground",

  root: "p-6 lg:p-8 flex flex-col gap-6 max-w-7xl mx-auto animate-fade-in",
  header: "flex items-center justify-between",
  title: "text-2xl font-bold text-foreground tracking-tight",
  subtitle: "text-sm text-muted-foreground mt-0.5",

  expiringAlert: [
    `flex items-center gap-3 px-5 py-3.5 ${radius.lg}`,
    `${colorScheme.warning.bg} border ${colorScheme.warning.border} cursor-pointer ${colorScheme.warning.hover}`,
    transition.colors,
  ].join(" "),
  expiringAlertIconWrap: `flex items-center justify-center w-8 h-8 rounded-xl ${colorScheme.warning.bg} ${colorScheme.warning.text} shrink-0`,
  expiringAlertText: `text-sm ${colorScheme.warning.text} flex-1`,
  expiringAlertCount: "font-semibold",
  expiringAlertChevron: `${colorScheme.warning.textMuted} shrink-0`,

  kpiSectionTitle:
    "text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3",
  kpiGrid: "grid grid-cols-4 gap-3",
  detailGrid: "grid grid-cols-2 gap-4",

  onlineBadge:
    "inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-lg font-semibold border",
  onlineBadgeOn: `${colorScheme.success.bg} ${colorScheme.success.text} ${colorScheme.success.border}`,
  onlineBadgeOff: "bg-muted text-muted-foreground border-border",
  onlineBadgeDot: `w-1.5 h-1.5 rounded-full ${colorScheme.success.solid} animate-pulse`,

  sectionAction:
    "flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer",

  sectionRowMain: "flex items-center gap-2.5",
  sectionRowName: "text-sm font-medium text-foreground",
  sectionRowMeta: "text-xs text-muted-foreground tabular-nums",

  expiringBadge: `inline-flex items-center text-[11px] px-2 py-0.5 rounded-lg font-semibold ${colorScheme.warning.bg} ${colorScheme.warning.text} border ${colorScheme.warning.border}`,
  expiringStatus: "text-xs px-2 py-0.5 rounded-lg border font-semibold",
  expiringStatusUrgent: `${colorScheme.danger.bg} ${colorScheme.danger.border} ${colorScheme.danger.text}`,
  expiringStatusWarning: `${colorScheme.warning.bg} ${colorScheme.warning.border} ${colorScheme.warning.text}`,
} as const;

// -------------------------------------------------------------
// UserManage — страница управления пользователями
// -------------------------------------------------------------

export const userManagePage = {
  root: "p-6 lg:p-8 max-w-7xl mx-auto flex flex-col gap-6 animate-fade-in",
  header: "flex items-center justify-between gap-4 flex-wrap",
  title: "text-xl font-bold text-foreground tracking-tight",
  subtitle: "text-sm text-muted-foreground mt-0.5",

  createButton: [
    "inline-flex items-center gap-2 px-4 h-9 rounded-xl",
    "bg-primary/10 text-primary border border-primary/20",
    "hover:bg-primary/15 text-sm font-medium",
    transition.colors,
  ].join(" "),

  tableCard: "overflow-hidden",
} as const;

// -------------------------------------------------------------
// ServersPage — страница управления серверами
// -------------------------------------------------------------

export const serversPage = {
  root: "p-6 lg:p-8 max-w-7xl mx-auto flex flex-col gap-6 animate-fade-in",
  header: "flex items-center justify-between gap-4 flex-wrap",
  title: "text-xl font-bold text-foreground tracking-tight",
  subtitle: "text-sm text-muted-foreground mt-0.5",

  createButton: [
    "inline-flex items-center gap-2 px-4 h-9 rounded-xl",
    "bg-primary/10 text-primary border border-primary/20",
    "hover:bg-primary/15 text-sm font-medium",
    transition.colors,
  ].join(" "),

  tableCard: "overflow-hidden",
} as const;

// -------------------------------------------------------------
// ChekavoPage — пошаговый гайд
// -------------------------------------------------------------

export const chekavoPage = {
  root: "flex justify-center py-8 px-4",
  inner: "w-full max-w-150 flex flex-col gap-4 animate-fade-in",
  title: "text-xl font-bold text-foreground tracking-tight",
  subtitle: "text-sm text-muted-foreground mt-0.5",
} as const;

// -------------------------------------------------------------
// NotFoundPage — страница 404
// -------------------------------------------------------------

export const notFoundPage = {
  root: "flex justify-center items-center min-h-screen px-4",
  inner: "w-full max-w-150 flex flex-col gap-4 animate-fade-in",

  title: "text-xl font-bold text-foreground tracking-tight",
  subtitle: "text-sm text-muted-foreground mt-0.5",

  card: "p-8 flex flex-col items-center gap-6 text-center",
  iconWrap: "relative",
  iconPulse: `absolute inset-0 ${radius.full} ${colorScheme.danger.bg} ${loading.pulse} scale-125`,
  iconInner: `relative flex items-center justify-center w-16 h-16 ${radius.full} ${colorScheme.danger.bg}`,
  icon: colorScheme.danger.text,

  codeWrap: "flex flex-col gap-2",
  code: "text-6xl font-extrabold text-foreground tracking-tight leading-none",
  description: "text-sm text-muted-foreground max-w-xs",

  backButton:
    "inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-medium bg-primary/12 text-primary border border-primary/24 hover:bg-primary/18 transition-colors",
} as const;
